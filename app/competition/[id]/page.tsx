import {Inter} from "next/font/google";
import {Metadata} from "next";
import React from "react";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Soccer Competition App",
    description: "Manage soccer competitions with your friends",
}

export default function RootLayout({
    children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
        <body className={inter.className}>

        </body>
        </html>
    )
}