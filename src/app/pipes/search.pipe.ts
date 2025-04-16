import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) {
      return items || [];  // إذا كانت البيانات فارغة أو النص فارغ، قم بإرجاع العناصر كما هي.
    }

    // تحويل النص إلى حرف صغير لتسهيل عملية المقارنة
    const lowerCaseSearchText = searchText.toLowerCase();

    // تصفية العناصر بناءً على النص المدخل
    return items.filter(item => {
      // تأكد من وجود خاصية title
      if (item && item.title) {
        return item.title.toLowerCase().includes(lowerCaseSearchText);
      }
      return false;
    });
  }

}
