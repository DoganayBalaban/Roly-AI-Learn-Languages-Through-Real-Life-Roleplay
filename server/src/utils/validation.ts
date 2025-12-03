import {z} from "zod"

export const registerSchema = z.object({
    fullName:z
    .string()
    .min(2,{message:"Adınız en az 2 karakter olmalıdır"})
    .max(50,{message:"Adınız en fazla 50 karakter olmalıdır"}),
    email:z.email({message:"Geçerli bir e-posta adresi giriniz"}),
    password:z.string().min(6,{message:"Parola en az 6 karakter olmalıdır"}),
})
export const loginSchema = z.object({
  email: z
    .email({ message: "Geçerli bir e-posta adresi giriniz." }),
  password: z
    .string()
    .min(1, { message: "Şifre boş bırakılamaz." })
});