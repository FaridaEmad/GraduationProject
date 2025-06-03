using Microsoft.EntityFrameworkCore.Query;
using System.Linq.Expressions;

namespace DealsHub.Data
{
    public interface IDataRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> GetAllAsyncInclude(Expression<Func<T, bool>> criteria, params Expression<Func<T, object>>[] includes);
        Task<T> GetByIdAsync(int id);
        Task<T> GetByIdAsyncInclude(Expression<Func<T, bool>> criteria, params Expression<Func<T, object>>[] includes);
        Task<T> GetByCustomCriteria(Expression<Func<T, bool>> criteria);
        Task AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
        Task<bool> Save();
        Task<T> GetWithIncludeAsync(Expression<Func<T, bool>> predicate, Func<IQueryable<T>, IIncludableQueryable<T, object>> include);
        Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
    }
}
