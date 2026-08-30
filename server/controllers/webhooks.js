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
        imageUrl: data.image_url || 'https://via.placeholder.com/150', // Default image
    }

    try {
        await User.create(userData)
        console.log("User created successfully:", userData._id)
    } catch (dbError) {
        console.error("Database error creating user:", dbError.message)
        throw dbError
    }
    break
}

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                    imageUrl: data.image_url,
                }

                await User.findByIdAndUpdate(data.id, userData)
                break
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id)
                break
            }
        }

        res.status(200).json({ success: true })

    } catch (error) {
        console.log("Webhook Error:", error.message)
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}