export interface ProfileUser {
    id: number;
    email: string;
    name: string;
    birthdate: string | null;
    gender: string;
    timezone: string;
    phone_number: string | null;
    is_onboarded: boolean;
    date_joined?: string;
    last_login?: string | null;
}

export interface ProfileEditData {
    name: string;
    birthdate: string;
    gender: string;
    country_code: string;
    mobile_number: string;
}

export interface PasswordData {
    old_password: string;
    new_password: string;
    new_password2: string;
}

export interface ProfileHeaderProps {
    isEditing: boolean;
    loading: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    onChangePassword: () => void;
}

export interface PersonalInfoCardProps {
    user: ProfileUser;
    isEditing: boolean;
    editData: ProfileEditData;
    onEditDataChange: (data: ProfileEditData) => void;
    formatDate: (dateString: string) => string;
}

export interface AccountInfoCardProps {
    user: ProfileUser;
    formatDate: (dateString: string) => string;
}

export interface PasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    passwordData: PasswordData;
    onPasswordDataChange: (data: PasswordData) => void;
    onSubmit: () => void;
    loading: boolean;
}
