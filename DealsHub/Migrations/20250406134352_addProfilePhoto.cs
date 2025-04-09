using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DealsHub.Migrations
{
    /// <inheritdoc />
    public partial class addProfilePhoto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ImageURIId",
                table: "ImageURIs",
                newName: "ImageURLId");

            migrationBuilder.AddColumn<string>(
                name: "ProfilePhoto",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfilePhoto",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "ImageURLId",
                table: "ImageURIs",
                newName: "ImageURIId");
        }
    }
}
