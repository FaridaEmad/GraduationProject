import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import Swal from 'sweetalert2';

interface ICategory {
  categoryId: number;
  name: string;
}

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CategoryManagementComponent implements OnInit {

  categories: ICategory[] = [];
  paginatedCategories: ICategory[] = [];
  categoryForm: FormGroup;
  isEdit = false;
  editingCategoryId: number | null = null;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  totalPages = 0;
  Math = Math; // Make Math available in template

  constructor(private categoryService: CategoryService, private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getallcategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.totalItems = data.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.updatePaginatedCategories();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        Swal.fire('Error', 'Failed to load categories', 'error');
      }
    });
  }

  updatePaginatedCategories(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCategories = this.categories.slice(startIndex, endIndex);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of visible pages
      let start = Math.max(2, this.currentPage - 1);
      let end = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      // Adjust if at the start
      if (this.currentPage <= 2) {
        end = 4;
      }
      
      // Adjust if at the end
      if (this.currentPage >= this.totalPages - 1) {
        start = this.totalPages - 3;
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < this.totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      // Always show last page
      pages.push(this.totalPages);
    }
    
    return pages;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedCategories();
    }
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      return;
    }

    const newName = this.categoryForm.value.name;
    
    // Check for duplicate category name
    const isDuplicate = this.categories.some(
      category => category.name.toLowerCase() === newName.toLowerCase() && 
      (!this.isEdit || category.categoryId !== this.editingCategoryId)
    );

    if (isDuplicate) {
      Swal.fire('Error', 'A category with this name already exists', 'error');
      return;
    }

    if (this.isEdit && this.editingCategoryId !== null) {
      this.categoryService.updateCategory(this.editingCategoryId, newName).subscribe({
        next: () => {
          this.loadCategories();
          this.resetForm();
          Swal.fire('Success', 'Category updated successfully', 'success');
        },
        error: (error) => {
          console.error('Error updating category:', error);
           if (error.status === 409) { // Conflict status code for duplicate
            Swal.fire('Error', 'A category with this name already exists', 'error');
          } else {
            Swal.fire('Error', 'Failed to create category', 'error');
          }}
      });
    } else {
      this.categoryService.createCategory({ name: newName }).subscribe({
        next: () => {
          this.loadCategories();
          this.resetForm();
          Swal.fire('Success', 'Category created successfully', 'success');
        },
        error: (error) => {
          console.error('Error creating category:', error);
          if (error.status === 409) { // Conflict status code for duplicate
            Swal.fire('Error', 'A category with this name already exists', 'error');
          } else {
            Swal.fire('Error', 'Failed to create category', 'error');
          }
        }
      });
    }
  }

  editCategory(category: ICategory) {
    this.isEdit = true;
    this.editingCategoryId = category.categoryId;
    this.categoryForm.patchValue({ name: category.name });
  }

  deleteCategory(categoryId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1c5694',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryService.deleteCategory(categoryId).subscribe({
          next: () => {
            this.loadCategories();
            Swal.fire('Deleted!', 'Category has been deleted.', 'success');
          },
          error: (error) => {
            console.error('Error deleting category:', error);
            if (error.status === 500) { // Conflict status code for category in use
              Swal.fire('Error', 'Cannot delete category that is associated with businesses', 'error');
            } else {
              Swal.fire('Error', 'Failed to delete category', 'error');
            }
          }
        });
      }
    });
  }

  resetForm() {
    this.isEdit = false;
    this.editingCategoryId = null;
    this.categoryForm.reset();
  }

  showAddCategoryForm() {
    this.isEdit = false;
    this.categoryForm.reset();
  }

  cancelEdit() {
    this.isEdit = false;
    this.categoryForm.reset();
  }
}