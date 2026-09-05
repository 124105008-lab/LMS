import { clerkClient, getAuth } from "@clerk/express"

// Middleware (Protect Educator Routes)
export const protectEducator = async (req, res, next) => {
    try {
        const { userId, isAuthenticated } = getAuth(req)

        console.log("USER ID:", userId)
        console.log("AUTHENTICATED:", isAuthenticated)

        if (!isAuthenticated || !userId) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            })
        }

        const response = await clerkClient.users.getUser(userId)

        if (response.publicMetadata?.role !== 'educator') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized Access'
            })
        }

        next()

    } catch (error) {
        console.error("AUTH ERROR:", error)

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}