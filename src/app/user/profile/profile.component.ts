import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { IUserProfile } from '../../core/interfaces/iuser';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, RouterModule, ReactiveFormsModule, DatePipe]
})
export class ProfileComponent implements OnInit {
  userPhoto = '';
  loggedUser: IUserProfile | null = null;
  phones: { id: number, phoneNumber: string }[] = [];

  isEditing = false;
  isEditingPhone = false;
  editingPhoneId: number | null = null;

  profilePhotoUrl = '';

  phoneForm!: FormGroup;
  profileForm!: FormGroup;

  constructor(
    private _AuthService: AuthService,
    private _UserService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      profilePhoto: ['', [Validators.pattern(/https?:\/\/.*\.(jpg|jpeg|png|gif)$/i)]],
      name: ['', [  Validators.minLength(3), Validators.maxLength(20)]],
      email: [{ value: this.loggedUser?.email, disabled: true }],
      password: ['', [ Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/)]]
    });

    this.phoneForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(?:\+20|0)?1[0125]\d{8}$/)]]
    });
  
    
  }

  ngOnInit(): void {
    console.log(this.profileForm);
    this._AuthService.saveUserData();
    const localUser = this._AuthService.getUserData();
    if (localUser?.email) {
      this.fetchUserProfile(localUser.email);
    }
  }

  fetchUserProfile(email: string): void {
    this._UserService.getallUsers().subscribe({
      next: (users: IUserProfile[]) => {
        const currentUser = users.find(u => u.email === email);
        if (currentUser) {
          this.loggedUser = currentUser;
          this.userPhoto = currentUser.profilePhoto || '';
          this.profileForm.patchValue({
            name: currentUser.name || '',
            profilePhoto: currentUser.profilePhoto || ''
          });

          this._UserService.getPhonesByUserId(currentUser.userId).subscribe({
            next: (phoneList: any[]) => {
              this.phones = phoneList.map(p => ({
                id: p.phoneId,
                phoneNumber: p.number
              }));
            }
          });
        }
      }
    });
  }

  editProfile(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.profileForm.patchValue({
      name: this.loggedUser?.name || '',
      profilePhoto: this.loggedUser?.profilePhoto || '',
      password: ''
    });
  }

  saveChanges(): void {
    if (!this.loggedUser || this.profileForm.invalid) return;

    const userId = this.loggedUser.userId;
    const { name, password, profilePhoto } = this.profileForm.value;

    const nameChanged = name && name !== this.loggedUser.name;
    const passwordChanged = password;
    const photoChanged = profilePhoto && profilePhoto !== this.userPhoto;

    const updates = [];

    if (nameChanged) updates.push(this.updateUserName(userId, name));
    if (passwordChanged) updates.push(this.changePassword(userId, password));
    if (photoChanged) updates.push(this.changeProfilePhoto(userId, profilePhoto));

    Promise.all(updates).then(() => {
      this.fetchUserProfile(this.loggedUser!.email);
      this.isEditing = false;
      Swal.fire('Success', 'Profile updated successfully', 'success');
    });
  }

  addOrUpdatePhone(): void {
    if (this.phoneForm.invalid || !this.loggedUser) return;

    const userId = this.loggedUser.userId;
    const phoneNumber = this.phoneForm.value.phoneNumber;

    if (this.isEditingPhone && this.editingPhoneId !== null) {
      this._UserService.updatePhone(this.editingPhoneId, phoneNumber).subscribe(() => {
        this.fetchUserProfile(this.loggedUser!.email);
        this.cancelEditPhone();
        Swal.fire('Success', 'Phone updated successfully', 'success');
      });
    } else {
      this._UserService.addNewPhone(userId, phoneNumber).subscribe(() => {
        this.fetchUserProfile(this.loggedUser!.email);
        this.phoneForm.reset();
        Swal.fire('Success', 'Phone added successfully', 'success');
      });
    }
  }

  editPhone(phone: { id: number, phoneNumber: string }): void {
    this.isEditingPhone = true;
    this.editingPhoneId = phone.id;
    this.phoneForm.patchValue({ phoneNumber: phone.phoneNumber });
  }

  cancelEditPhone(): void {
    this.isEditingPhone = false;
    this.editingPhoneId = null;
    this.phoneForm.reset();
  }

  removePhone(phoneId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the phone number.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it'
    }).then(result => {
      if (result.isConfirmed) {
        this._UserService.deletePhone(phoneId).subscribe(() => {
          this.phones = this.phones.filter(p => p.id !== phoneId);
          Swal.fire('Deleted', 'Phone number removed', 'success');
        });
      }
    });
  }

  updateUserName(userId: number, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._UserService.changeUserName(userId, name).subscribe({
        next: () => resolve(),
        error: err => reject(err)
      });
    });
  }

  changeProfilePhoto(userId: number, newPhotoUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._UserService.changeProfilePhoto(userId, newPhotoUrl).subscribe({
        next: () => resolve(),
        error: err => reject(err)
      });
    });
  }

  changePassword(userId: number, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._UserService.changePassword(userId, newPassword).subscribe({
        next: () => resolve(),
        error: err => reject(err)
      });
    });
  }

  get phoneControl() {
    return this.phoneForm.get('phoneNumber');
  }

  get nameControl() {
    return this.profileForm.get('name');
  }

  get passwordControl() {
    return this.profileForm.get('password');
  }
}
