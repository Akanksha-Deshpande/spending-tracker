import {Router} from "express";
import {User} from "../models/User";
import {hashPassword, comparePassword} from "../utils/password";
import {createToken} from "../utils/jwt";
import {authenticate} from "../middleware/authenticate";

const router = Router();

router.post("/signup", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message:
                    "Name, email and password are required",
            });
        }


        const normalizedEmail =
            email.toLowerCase().trim();

        const existingUser =
            await User.findOne({
                email: normalizedEmail,
            });

        if (existingUser) {
            return res.status(409).json({
                message:
                    "An account with this email already exists",
            });
        }

        const passwordHash =
            await hashPassword(password);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: passwordHash,
        });

        return res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error(
            "Error during signup:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/login", async (req,res)=>{
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({message: "Email and password are required"});
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({email: normalizedEmail});
        
        if(!user){
            return res.status(401).json({message: "Invalid email or password"});
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if(!isPasswordValid){
            return res.status(401).json({message: "Invalid email or password"});
        }

        const token = createToken(user._id.toString());

        return res.status(200).json({token,
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
            }
        });
    }
    catch(error){
        console.error("Error during login:", error);
        return res.status(500).json({message: "Internal server error"});
    }
})

router.get("/profile", authenticate, async (req, res) => {
    try {
        const user = await User.findById(
            req.user!.userId
        ).select("_id name email");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error(
            "Error fetching current user:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
export default router;