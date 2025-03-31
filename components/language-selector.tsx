"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {Button} from "@/components/ui/button";
import {Globe} from "lucide-react";
import {useLanguage} from "@/lib/i18n/language-context";


export function LanguageSelector() {
    const {language, setLanguage, t} = useLanguage()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Globe className="h-4 w-4 mr-2">
                        {t("language")}
                    </Globe>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-muted" : ""}>{t("english")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("pt")} className={language === "pt" ? "bg-muted" : ""}>{t("portuguese")}</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}