"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function joinWaitlist(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  try {
    // 1. Maili Resend "Contacts" listesine ekle
    const { data, error } = await resend.contacts.create({
      email: email,
      firstName: "", // İstersen adını da alabilirsin
      unsubscribed: false,
      audienceId: "5c614041-a669-4c2a-aab0-57ac584d2b43", // Resend panelinden alacağın ID
    });

    if (error) {
      console.error("Resend Error:", error);
      return { error: "Something went wrong. Please try again." };
    }

    // (Opsiyonel) 2. Kullanıcıya "Hoş geldin" maili at
    /*
    await resend.emails.send({
      from: 'RolyAI <hello@senindomainin.com>',
      to: email,
      subject: 'Welcome to RolyAI Waitlist! 🚀',
      html: '<p>Thanks for joining! We will notify you soon.</p>'
    });
    */

    return { success: true };
  } catch (e) {
    return { error: "Server error" };
  }
}
