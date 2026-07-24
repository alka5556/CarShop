export const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) return null

    try {
        const response = await fetch('http://localhost:3000/users/refresh', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken })
        })

        if (!response.ok) {
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            return null
        }

        const result = await response.json()
        localStorage.setItem("accessToken", result.accessToken)
        localStorage.setItem("refreshToken", result.refreshToken)
        return result.accessToken
    } catch (error) {
        console.error("Refresh failed:", error)
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        return null
    }
}