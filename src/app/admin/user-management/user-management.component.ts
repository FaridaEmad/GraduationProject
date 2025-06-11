import { Component, OnInit } from '@angular/core';
import { IUser, IUserCreate } from '../../core/interfaces/iuser';
import { UserService } from '../../core/services/user.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: IUser[] = [];
  filteredUsers: IUser[] = [];
  userToEdit: IUser | null = null;
  adminForm: FormGroup;
  
  searchTerm: string = '';
  genderFilter: string = '';
  
  sortDirection: 'asc' | 'desc' = 'asc';
  sortBy: 'name' | 'createdAt' = 'name';
  currentPage: number = 1;
  itemsPerPage: number = 30;
  totalItems: number = 0;
  totalPages: number = 0;
 
  protected readonly Math = Math;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.adminForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[!@#$%^&])[A-Za-z\d!@#$%^&]{6,}$/)]],
      gender: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^(?:\+20|0)?1[0125]\d{8}$/)]],
      profilePhoto: ['', [Validators.pattern(/https?:\/\/.*\.(jpg|jpeg|png|gif)$/i)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }
loadUsers(): void {
    this.userService.getallUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.totalItems = data.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.updatePaginatedUsers();
      },
      error: (err) => {
        console.error('Error loading users', err);
        Swal.fire('Error', 'An error occurred while loading users', 'error');
      }
    });
  }
  
  // فلترة المستخدمين بناءً على الاسم، البريد، والجنس
  filterUsers(): void {
    this.filteredUsers = this.users.filter(user =>
      (user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (this.genderFilter === '' || user.gender.toLowerCase() === this.genderFilter.toLowerCase())
    );
    this.currentPage = 1; // إعادة التعيين إلى الصفحة الأولى بعد البحث
    this.sortUsers(); // ترتيب المستخدمين بعد الفلترة
  }
  
  // ترتيب المستخدمين بناءً على الاسم أو تاريخ الإنشاء
  sortUsers(): void {
    this.filteredUsers.sort((a, b) => {
      let comparison = 0;
      
      if (this.sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (this.sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  updatePaginatedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredUsers = this.users.slice(startIndex, endIndex);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, this.currentPage - 1);
      let end = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      if (this.currentPage <= 2) {
        end = 4;
      }
      
      if (this.currentPage >= this.totalPages - 1) {
        start = this.totalPages - 3;
      }
      
      if (start > 2) {
        pages.push(-1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < this.totalPages - 1) {
        pages.push(-2);
      }
      
      pages.push(this.totalPages);
    }
    
    return pages;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedUsers();
    }
  }

  
  

  openAddAdminModal(): void {
    const modalElement = document.getElementById('addAdminModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  onSubmit(): void {
    if (this.adminForm.valid) {
      if (this.userToEdit) {
        // Edit existing user - only update name
        this.userService.changeUserName(this.userToEdit.userId, this.adminForm.value.name).subscribe({
          next: () => {
            Swal.fire({
              title: 'Success!',
              text: 'User name updated successfully',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            this.loadUsers();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addAdminModal'));
            modal?.hide();
            this.userToEdit = null;
          },
          error: (err) => {
            console.error('Error updating user name', err);
            Swal.fire('Error', 'Failed to update user name', 'error');
          }
        });
      } else {
        // Add new admin
        const newAdmin: IUserCreate = {
          ...this.adminForm.value,
          role: 'admin'
        };

        this.userService.addAdmin(newAdmin).subscribe({
          next: () => {
            Swal.fire({
              title: 'Success!',
              text: 'Admin user created successfully',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            this.loadUsers();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addAdminModal'));
            modal?.hide();
          },
          error: (err) => {
            console.error('Error creating admin', err);
            Swal.fire('Error', 'Failed to create admin user', 'error');
          }
        });
      }
    }
  }
editUser(user: IUser): void {
    this.userToEdit = { ...user };
    setTimeout(() => {
      const modalElement = document.getElementById('editModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      } else {
        console.error('editModal not found in the DOM');
      }
    });
  }
  
  updateUserName(): void {
    if (this.userToEdit?.userId) {
      this.userService.changeUserName(this.userToEdit.userId, this.userToEdit.name).subscribe({
        next: () => {
          const index = this.users.findIndex(u => u.userId === this.userToEdit!.userId);
          if (index !== -1) {
            this.users[index].name = this.userToEdit!.name;
          }
          
          Swal.fire('Updated', 'User name updated successfully', 'success');
          
          // إغلاق المودال برمجيًا
          const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
          modal?.hide();

          this.userToEdit = null;
        },
        error: (err) => {
          console.error('Error updating user name', err);
          Swal.fire('Error', 'An error occurred while updating user name', 'error');
        }
      });
    }
  }

  deleteUser(userId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'User has been deleted.', 'success');
            this.loadUsers();
          },
          error: (err=500) => {
            console.error('You Can Only Delete Admins', err);
            Swal.fire('Error', 'You Can Only Delete Admins', 'error');
          }
        });
      }
    });
  }
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  addAdmin(): void {
    if (this.adminForm.valid) {
      const adminData = this.adminForm.value;
  
      console.log("Admin Data", adminData);
  
      this.userService.addAdmin(adminData).subscribe({
        next: () => {
          Swal.fire('Success', 'Admin added successfully', 'success');
          this.loadUsers();
          this.adminForm.reset();
          const modal = document.getElementById('addAdminModal');
          if (modal) bootstrap.Modal.getInstance(modal)?.hide();
        },
        error: (err) => {
          console.error('Error adding admin', err);
          Swal.fire('Error', 'An error occurred while adding admin', 'error');
        }
      });
    } else {
      this.markFormGroupTouched(this.adminForm);
    }
  }
  // Getter methods for form controls
  get name() { return this.adminForm.get('name'); }
  get email() { return this.adminForm.get('email'); }
  get password() { return this.adminForm.get('password'); }
  get gender() { return this.adminForm.get('gender'); }
  get phone() { return this.adminForm.get('phone'); }
  get profilePhoto() { return this.adminForm.get('profilePhoto'); }

}