import { clerkClient, getAuth } from '@clerk/express'
import Course from '../modles/Course.js'
import { v2 as cloudinary } from 'cloudinary'
import User from '../modles/User.js'
import Purchase from '../modles/Purchase.js'


// Update role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
     ///   const userId = req.auth.userId
           const {userId} = getAuth(req)
         //  const educator = userId

        console.log('USER ID:', userId)

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            })
        }

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator'
            }
        })

        res.json({
            success: true,
            message: 'You can publish a course now'
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// Add New Course
export const addCourse = async (req, res) => {
    try {

        // Get course data from form-data
        const { courseData } = req.body || {}

        // Get uploaded image
        const imageFile = req.file

        // Get educator ID
     //   const educatorId = req.auth.userId
          const { userId } = getAuth(req)
          const educatorId = userId



        if (!imageFile) {
            return res.json({
                success: false,
                message: 'Thumbnail Not Attached'
            })
        }

        // Convert courseData JSON string into object
        const parsedCourseData = JSON.parse(courseData)

        // Add educator ID
        parsedCourseData.educator = educatorId

        // Create course
        const newCourse = await Course.create(parsedCourseData)

        // Upload thumbnail to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(
            imageFile.path
        )

        // Save Cloudinary URL
        newCourse.courseThumbnail = imageUpload.secure_url

        await newCourse.save()

        res.json({
            success: true,
            message: 'Course Added'
        })

    } catch (error) {

        console.log(error)

        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
        //Get Educator Courses
        export const getEducatorCourses = async (req,res)=>{
            try{
               const educator =  req.auth.userId
               const courses = await Course.find({educator})
               res.json({ success: true,courses})
            } catch (error){
                res.json({ success: false,message: error.message })
            }
        }

 // Get Educator Dashboard Data (Total Earning, Enrolled Students,No. of Courses)

 export const educatorDashboardData = async(req,res)=>{
    try{
        // const educator = req.auth.userId;
        const { userId } = getAuth(req)
        const educator = userId
        
        const courses = await Course.find({educator});
        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        // Calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: {$in: courseIds},
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase)=> sum + purchase.amount, 0);
        
        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        for(const course of courses){
            const students = await User.find({
                _id: {$in: course.enrolledStudents}
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }
        
        res.json({success: true, dashboardData: {
            totalEarnings,enrolledStudentsData, totalCourses
        }})

    } catch (error){
        res.json({success: false, message: error.message })
    }
 }

 //Get Enrolled Students Data withPurchase Data

 export const getEnrolledStudentsData = async (req,res)=>{
    try{
        const educator = req.auth.userId;
        const courses = await Course.find({educator});
        const courseIds = courses.map(course => course._id);

        const purchase = await Purchase.find({
            courseId: {$in: courseIds},
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId','courseTitle')

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseData: purchase.createdAt

     } ));

     res.json({success: true, enrolledStudents})


    } catch (error){
        res.json({success: false, message:error.message })
    }
 }