using DealsHub.Models;

namespace DealsHub.Data
{
    public interface IAuthRepository
    {
        Task<User> Register(User user, string password);
        Task<User> Login(string email, string password);
        Task<bool> UserExist(string email);
        Task<User> ChangePassword(User user, string password);
        Task<User> forgetPassword(string email, string password);
    }
}
