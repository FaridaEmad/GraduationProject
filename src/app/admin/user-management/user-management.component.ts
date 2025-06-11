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
  currentPage: number = 1;
  itemsPerPage: number = 5;
  sortDirection: 'asc' | 'desc' = 'asc';
  sortBy: 'name' | 'createdAt' = 'name';

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

  // تحميل جميع المستخدمين
  loadUsers(): void {
    this.userService.getallUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
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
  
  // إرجاع المستخدمين حسب الصفحة الحالية
  paginatedUsers(): IUser[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }
  
  // تغيير الصفحة
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  // حساب العدد الكلي للصفحات
  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }
  
  // إرجاع مصفوفة الصفحات للمساعده في التكرار
  totalPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }
  
  // فتح مودال التعديل
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
  
  // تحديث اسم المستخدم
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
  
  // حذف المستخدم
  deleteUser(userId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This user will be deleted permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.userId !== userId);
            this.filteredUsers = this.filteredUsers.filter(u => u.userId !== userId);
            Swal.fire('Deleted', 'User has been deleted successfully', 'success');
          },
          error: (err) => {
            console.error('Error deleting user', err);
            Swal.fire('Error', "Admin Can't Delete User", 'error');
          }
        });
      }
    });
  }

  // فتح مودال إضافة الأدمن
  openAddAdminModal(): void {
    const modalElement = document.getElementById('addAdminModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  
  // إضافة أدمن
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
          Swal.fire('Error', 'Admin Already Exixts', 'error');
        }
      });
    } else {
      this.markFormGroupTouched(this.adminForm);
    }
  }
  
  // Helper method to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getter methods for form controls
  get name() { return this.adminForm.get('name'); }
  get email() { return this.adminForm.get('email'); }
  get password() { return this.adminForm.get('password'); }
  get gender() { return this.adminForm.get('gender'); }
  get phone() { return this.adminForm.get('phone'); }
  get profilePhoto() { return this.adminForm.get('profilePhoto'); }
}