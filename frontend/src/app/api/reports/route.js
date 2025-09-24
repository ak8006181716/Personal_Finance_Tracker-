import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email, password, apiBase: apiBaseOverride } = body || {}

    const apiBase = apiBaseOverride || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'
    // process.cwd() is the frontend dir; the python script is one level up in /python
    const workspaceRoot = path.resolve(process.cwd(), '..')
    const scriptPath = path.join(workspaceRoot, 'python', 'report_generator.py')

    const cookieHeader = request.headers.get('cookie') || ''
    const args = cookieHeader ? [scriptPath, apiBase, cookieHeader] : [scriptPath, apiBase, email || '', password || '']
    const result = await new Promise((resolve, reject) => {
      const spawnWith = (cmd) => spawn(cmd, args, { cwd: workspaceRoot })
      let py = spawnWith('python')
      let out = ''
      let err = ''
      py.stdout.on('data', (d) => { out += d.toString() })
      py.stderr.on('data', (d) => { err += d.toString() })
      py.on('error', () => {
        // fallback to Windows py launcher
        py = spawnWith('py')
        py.stdout.on('data', (d) => { out += d.toString() })
        py.stderr.on('data', (d) => { err += d.toString() })
        py.on('close', (code) => {
          if (code === 0) return resolve(out)
          reject(new Error(err || `Python exited with code ${code}`))
        })
      })
      py.on('close', (code) => {
        if (code === 0) return resolve(out)
        // If it failed without triggering 'error', bubble up
        reject(new Error(err || `Python exited with code ${code}`))
      })
    })

    const parsed = JSON.parse(result)
    return NextResponse.json(parsed)
  } catch (e) {
    return NextResponse.json({ ok: false, message: e.message }, { status: 500 })
  }
}


