import os
import sys
import json
import sqlite3
import csv
from datetime import datetime, timedelta

try:
    import requests
except ImportError:
    print("Missing dependency: requests. Install with: pip install requests", file=sys.stderr)
    sys.exit(1)


def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def write_csv(path, rows, headers):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in headers})


def main():
    if len(sys.argv) < 2:
        print("Usage: report_generator.py <api_base_url> [email password] [cookieHeader]", file=sys.stderr)
        sys.exit(2)

    api_base = sys.argv[1].rstrip('/')
    email = None
    password = None
    cookie_header = None

    # Accept either (email, password) or a raw cookie header as the next args
    if len(sys.argv) >= 4 and ('=' not in sys.argv[2]):
        email = sys.argv[2]
        password = sys.argv[3]
        if len(sys.argv) >= 5:
            cookie_header = sys.argv[4]
    elif len(sys.argv) >= 3:
        cookie_header = sys.argv[2]

    reports_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'reports'))

    session = requests.Session()

    # Auth: prefer cookie header if provided, else try login with email/password
    if cookie_header:
        session.headers.update({ 'Cookie': cookie_header })
    else:
        if not (email and password):
            print("Auth required: provide cookie header or email/password", file=sys.stderr)
            sys.exit(3)
        login_resp = session.post(f"{api_base}/users/login", json={"email": email, "password": password})
        if login_resp.status_code >= 400:
            print(f"Login failed: {login_resp.status_code} {login_resp.text}", file=sys.stderr)
            sys.exit(3)

    # Fetch expenses
    exp_resp = session.get(f"{api_base}/expences")
    expenses_payload = exp_resp.json() if exp_resp.text else {}
    expenses = (
        expenses_payload.get('data', {}).get('expenses')
        or expenses_payload.get('data', {}).get('items')
        or expenses_payload.get('expenses')
        or expenses_payload.get('items')
        or []
    )

    # Fetch budgets
    bud_resp = session.get(f"{api_base}/budgets")
    budgets_payload = bud_resp.json() if bud_resp.text else {}
    budgets = (
        budgets_payload.get('data', {}).get('budgets')
        or budgets_payload.get('budgets')
        or []
    )

    # Normalize and write CSVs
    expense_rows = []
    for e in expenses:
        expense_rows.append({
            'id': e.get('_id', ''),
            'amount': e.get('amount', ''),
            'category': e.get('category', ''),
            'date': (e.get('date') or '')[:10],
            'paymentMethod': e.get('paymentMethod', ''),
            'notes': e.get('notes', ''),
        })
    write_csv(os.path.join(reports_dir, 'expenses.csv'), expense_rows, ['id','amount','category','date','paymentMethod','notes'])

    budget_rows = []
    for b in budgets:
        budget_rows.append({
            'id': b.get('_id', ''),
            'category': b.get('category', ''),
            'month': b.get('month', ''),
            'amount': b.get('amount', ''),
        })
    write_csv(os.path.join(reports_dir, 'budgets.csv'), budget_rows, ['id','category','month','amount'])

    # Suggestions (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent = []
    for e in expenses:
        try:
            d = datetime.fromisoformat((e.get('date') or '')[:19])
        except Exception:
            d = None
        if d and d >= thirty_days_ago:
            recent.append(e)
    spend_by_cat = {}
    for e in recent:
        c = e.get('category') or 'Uncategorized'
        spend_by_cat[c] = spend_by_cat.get(c, 0) + float(e.get('amount') or 0)
    suggestions = []
    # naive heuristics
    for cat, val in sorted(spend_by_cat.items(), key=lambda x: -x[1])[:3]:
        suggestions.append(f"You're spending a lot on {cat}. Try to reduce it by 15%.")

    # Summary
    total_expense = sum(float(x.get('amount') or 0) for x in expenses)
    budget_by_category = {}
    for b in budgets:
        cat = b.get('category') or 'Uncategorized'
        budget_by_category[cat] = budget_by_category.get(cat, 0) + float(b.get('amount') or 0)

    summary = {
        'generatedAt': datetime.utcnow().isoformat() + 'Z',
        'totalExpenses': total_expense,
        'numExpenses': len(expenses),
        'numBudgets': len(budgets),
        'budgetByCategory': budget_by_category,
    }
    write_json(os.path.join(reports_dir, 'summary.json'), summary)
    write_json(os.path.join(reports_dir, 'suggestions.json'), { 'suggestions': suggestions })

    # SQLite monthly report (very simple schema)
    db_path = os.path.join(reports_dir, 'reports.db')
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS monthly_reports (user_email TEXT, month TEXT, total_spent REAL, top_category TEXT, overbudget_categories TEXT)")
    month_key = datetime.utcnow().strftime('%Y-%m')
    top_cat_name = max(budget_by_category.keys(), key=lambda k: budget_by_category[k]) if budget_by_category else ''
    # Determine overbudget categories (requires expense totals per category; approximate using budget_by_category only here)
    overbudget = []
    cur.execute("INSERT INTO monthly_reports (user_email, month, total_spent, top_category, overbudget_categories) VALUES (?,?,?,?,?)",
                (email or 'cookie-auth', month_key, total_expense, top_cat_name, json.dumps(overbudget)))
    conn.commit()
    conn.close()

    print(json.dumps({
        'ok': True,
        'reports': {
            'expensesCsv': 'reports/expenses.csv',
            'budgetsCsv': 'reports/budgets.csv',
            'summaryJson': 'reports/summary.json',
            'suggestionsJson': 'reports/suggestions.json',
            'sqliteDb': 'reports/reports.db'
        }
    }))


if __name__ == '__main__':
    main()


