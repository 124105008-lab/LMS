import { Webhook } from 'svix'
import User from '../models/User.js'

export const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        await whook.verify(req.body, {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        })

        const { data, type } = JSON.parse(req.body.toString())

        switch (type) {

            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0]?.email_address,
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                    imageUrl: data.image_url || 'https://via.placeholder.com/150',
                }

                console.log("🔔 Creating user with data:", userData)
                await User.create(userData)
                console.log("✅ User created successfully:", userData._id)
                break
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0]?.email_address,
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                    imageUrl: data.image_url || 'https://via.placeholder.com/150',
                }

                console.log("🔄 Updating user:", data.id)
                await User.findByIdAndUpdate(data.id, userData)
                console.log("✅ User updated successfully:", data.id)
                break
            }

            case 'user.deleted': {
                console.log("🗑️ Deleting user:", data.id)
                await User.findByIdAndDelete(data.id)
                console.log("✅ User deleted successfully:", data.id)
                break
            }
        }

        res.status(200).json({ success: true })

    } catch (error) {
        console.error("❌ Webhook Error:", error.message)
        console.error("Stack:", error.stack)
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}
