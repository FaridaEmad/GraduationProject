using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DealsHub.Migrations
{
    /// <inheritdoc />
    public partial class addFees : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Fees",
                table: "PaymentMethods",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Fees",
                table: "PaymentMethods");
        }
    }
}
