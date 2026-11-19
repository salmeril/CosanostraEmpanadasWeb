export function json(data, init = {}) {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json; charset=utf-8')
  headers.set('cache-control', 'no-store')

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  })
}

export function methodNotAllowed(allowed = ['POST']) {
  return json(
    { error: 'METHOD_NOT_ALLOWED', message: 'Método no permitido.' },
    { status: 405, headers: { allow: allowed.join(', ') } },
  )
}

export async function readJson(request) {
  try {
    return await request.json()
  } catch {
    throw new RequestError('INVALID_JSON', 'El cuerpo de la solicitud no es JSON válido.')
  }
}

export class RequestError extends Error {
  constructor(code, message, status = 400, details = undefined) {
    super(message)
    this.name = 'RequestError'
    this.code = code
    this.status = status
    this.details = details
  }
}

export function errorResponse(error) {
  if (error instanceof RequestError) {
    return json(
      { error: error.code, message: error.message, details: error.details },
      { status: error.status },
    )
  }

  console.error(error)
  return json(
    { error: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado.' },
    { status: 500 },
  )
}
