using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fitzo.API.Migrations
{
    /// <inheritdoc />
    public partial class AddedRecipesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RecipeComponent",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Discriminator = table.Column<string>(type: "character varying(21)", maxLength: 21, nullable: false),
                    RecipeId = table.Column<Guid>(type: "uuid", nullable: true),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    Tags = table.Column<int[]>(type: "integer[]", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeComponent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecipeComponent_RecipeComponent_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "RecipeComponent",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_RecipeComponent_RecipeId",
                table: "RecipeComponent",
                column: "RecipeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RecipeComponent");
        }
    }
}
