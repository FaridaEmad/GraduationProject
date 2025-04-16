import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'termtxt'
})
export class TermtxtPipe implements PipeTransform {

  transform(text: string, limit: number): string {
    // التأكد من أن النص غير فارغ أو undefined
    if (!text) {
      return ''; // أو ترجع قيمة افتراضية تانية لو حبيت
    }

    const words = text.split(" ");  // تقسيم النص إلى كلمات
    if (words.length > limit) {
      return words.slice(0, limit).join(" ") + '...';  // إرجاع أول limit كلمة مع إضافة "..."
    }
    return text;  // إذا كانت الكلمات أقل من limit، نعيد النص كما هو
  }

}
