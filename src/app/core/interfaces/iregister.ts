export interface IRegister {
    name: string;
    email: string;
    password: string;
    gender: string;
    phone: string;
    profilePhoto: string;  // أو 'File' إذا كنتِ ترسلين الصورة مباشرة
}

export interface ILogin {
    email: string;
    password: string;
}

export interface IChangePassword {
    oldPassword: string;
    newPassword: string;
}

export interface IForgotPassword {
    email: string;
}

export interface IChangeName {
    name: string;
}

export interface IChangePhoto {
    profilePhoto: string;  // أو 'File' إذا كانت الصورة ملفًا
}
