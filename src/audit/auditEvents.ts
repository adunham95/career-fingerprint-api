export enum AUDIT_EVENT {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_SUCCESS_TOKEN = 'login_success_w_token',
  LOGIN_FAILED = 'login_failed',
  LOGIN_FAILED_TOKEN = 'login_failed_w_token',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  USER_CREATED = 'user_created',
  ADMIN_ADDED = 'admin_added',
  ADMIN_REMOVE = 'admin_removed',
  ADMIN_EDIT_DATA = 'admin_edited_user_data',
}
