"use client"

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Course } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/contexts/language-context";

interface GradeFormProps {
    initialData: Course;
    courseId: string;
}

const formSchema = z.object({
    grade: z.coerce.number().nullable().optional()
});

export const GradeForm = ({
    initialData,
    courseId
}: GradeFormProps) => {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            grade: initialData?.grade ?? null,
        }
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/courses/${courseId}`, values);
            toast.success(t("teacher.courseEdit.forms.updateSuccess"));
            toggleEdit();
            router.refresh();
        } catch {
            toast.error(t("teacher.courseEdit.forms.updateError"));
        }
    }

    return (
        <div className="mt-6 border bg-card rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                {t("teacher.courseEdit.forms.courseGrade") || "Course Grade"}
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && (<>{t("common.cancel")}</>)}
                    {!isEditing && (
                    <>
                        <Pencil className="h-4 w-4 mr-2" />
                        {t("teacher.courseEdit.forms.editGrade") || "Edit Grade"}
                    </>)}
                </Button>
            </div>
            {!isEditing && (
                <p className={cn(
                    "text-sm mt-2 text-muted-foreground",
                    !initialData.grade && "text-muted-foreground italic"
                )}>
                    {initialData.grade 
                      ? t("teacher.courseEdit.forms.gradeDisplay", { grade: initialData.grade })
                      : t("teacher.courseEdit.forms.noGrade")
                    }
                </p>
            )}

            {isEditing && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField 
                            control={form.control}
                            name="grade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            value={field.value?.toString() || "all"} 
                                            onValueChange={(value) => {
                                                field.onChange(value === "all" ? null : parseInt(value));
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("teacher.courseEdit.forms.selectGrade") || "Select grade (optional)"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t("teacher.courseEdit.forms.allGrades")}</SelectItem>
                                                <SelectItem value="9">{t("teacher.courseEdit.forms.grade9")}</SelectItem>
                                                <SelectItem value="10">{t("teacher.courseEdit.forms.grade10")}</SelectItem>
                                                <SelectItem value="11">{t("teacher.courseEdit.forms.grade11")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center gap-x-2">
                            <Button disabled={isSubmitting} type="submit">
                                {t("common.save") || "Save"}
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    )
}

