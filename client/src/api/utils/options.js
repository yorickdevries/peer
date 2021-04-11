import client from "../axiosClient"

export function postOption(url, body) {
    const { points } = body
    if (points !== undefined && points !== null) {
        body.points = points * 100
    }
    return client.post(url, body)
}

export function patchOption(url, option) {
    const { text, points } = option
    const body = points !== undefined && points !== null ? { text, points: points * 100 } : { text }
    return client.patch(url, body)
}

export function deleteOption(url) {
    return client.delete(url)
}
