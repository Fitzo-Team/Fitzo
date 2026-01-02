using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fitzo.API.Migrations
{
    /// <inheritdoc />
    public partial class AddedMealPlanning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RecipeComponent_RecipeComponent_RecipeId",
                table: "RecipeComponent");

            migrationBuilder.CreateTable(
                name: "MealPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RecipeId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealPlans_RecipeComponent_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "RecipeComponent",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MealPlans_RecipeId",
                table: "MealPlans",
                column: "RecipeId");

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeComponent_RecipeComponent_RecipeId",
                table: "RecipeComponent",
                column: "RecipeId",
                principalTable: "RecipeComponent",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RecipeComponent_RecipeComponent_RecipeId",
                table: "RecipeComponent");

            migrationBuilder.DropTable(
                name: "MealPlans");

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeComponent_RecipeComponent_RecipeId",
                table: "RecipeComponent",
                column: "RecipeId",
                principalTable: "RecipeComponent",
                principalColumn: "Id");
        }
    }
}
