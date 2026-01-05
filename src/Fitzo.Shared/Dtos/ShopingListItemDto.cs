namespace Fitzo.Shared.Dtos
{
    public class ShoppingListItem
    {
        public string ProductId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public double TotalAmount { get; set; }
        public string Unit { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public bool IsBought { get; set; } = false;
    }
}