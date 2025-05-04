import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ICategory } from '../../core/interfaces/icategory';
import { CategoryService } from '../../core/services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss']
})
export class CategoryManagementComponent implements OnInit {

  categories: ICategory[] = [];
  categoryForm!: FormGroup;
  isEdit: boolean = false;
  selectedCategoryId: number | null = null;

  constructor(private categoryService: CategoryService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadCategories();
    this.categoryForm = this.fb.group({
      name: ['']
    });
  }

  loadCategories() {
    this.categoryService.getallcategories().subscribe(data => {
      this.categories = data;
    });
  }

  onSubmit() {
    const newName = this.categoryForm.value.name;
    if (this.isEdit && this.selectedCategoryId !== null) {
      this.categoryService.updateCategory(this.selectedCategoryId, newName).subscribe(() => {
        this.loadCategories();
        this.resetForm();
        Swal.fire('Updated!', 'Category has been updated.', 'success');
      });
    } else {
      this.categoryService.createCategory({ name: newName }).subscribe(() => {
        this.loadCategories();
        this.resetForm();
        Swal.fire('Added!', 'Category has been added.', 'success');
      });
    }
  }

  editCategory(category: ICategory) {
    this.isEdit = true;
    this.selectedCategoryId = category.categoryId;
    this.categoryForm.patchValue({ name: category.name });
  }

  deleteCategory(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "This will delete the category permanently.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryService.deleteCategory(id).subscribe({
          next: () => {
            this.loadCategories();
            Swal.fire('Deleted!', 'Category has been deleted.', 'success');
          },
          error: (err) => {
            if (err.status === 500) {
              Swal.fire('Error!', 'You cannot delete this category because it is in use by businesses.', 'error');
            } else {
              Swal.fire('Error!', 'Something went wrong. Please try again later.', 'error');
            }
          }
        });
      }
    });
  }

  resetForm() {
    this.isEdit = false;
    this.selectedCategoryId = null;
    this.categoryForm.reset();
  }
}
