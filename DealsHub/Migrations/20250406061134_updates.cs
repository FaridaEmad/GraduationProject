using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DealsHub.Migrations
{
    /// <inheritdoc />
    public partial class updates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "URI",
                table: "ImageURIs",
                newName: "URL");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Carts",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Carts");

            migrationBuilder.RenameColumn(
                name: "URL",
                table: "ImageURIs",
                newName: "URI");
        }
    }
}
