import { Store, Utensils, Calendar, ShoppingBag, Apple, Cake } from "lucide-react";

const categories = [
  {
    icon: Utensils,
    name: "Restaurants",
    description: "Fresh prepared meals & ingredients",
    count: "1,200+",
    color: "from-primary to-primary/80",
  },
  {
    icon: Store,
    name: "Grocery Stores",
    description: "Produce, dairy, and packaged goods",
    count: "800+",
    color: "from-secondary to-secondary/80",
  },
  {
    icon: Calendar,
    name: "Events & Catering",
    description: "Surplus from events and parties",
    count: "500+",
    color: "from-primary to-secondary",
  },
  {
    icon: Apple,
    name: "Farms & Producers",
    description: "Fresh harvested produce",
    count: "350+",
    color: "from-leaf to-primary",
  },
  {
    icon: ShoppingBag,
    name: "Bakeries & Cafes",
    description: "Breads, pastries, and coffee",
    count: "600+",
    color: "from-carrot to-secondary",
  },
  {
    icon: Cake,
    name: "Food Manufacturers",
    description: "Packaged and processed foods",
    count: "200+",
    color: "from-primary to-secondary/70",
  },
];

const FoodCategories = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider mb-4 block">
            Food Sources
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Donations from Every Sector
          </h2>
          <p className="text-muted-foreground text-lg">
            We partner with businesses across the food industry to rescue quality food before it goes to waste.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative z-10">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-foreground/20 transition-colors duration-300">
                  <category.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>

                <h3 className="text-lg font-bold text-foreground group-hover:text-primary-foreground mb-1 transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground group-hover:text-primary-foreground/80 mb-3 transition-colors duration-300">
                  {category.description}
                </p>

                <div className="text-sm font-semibold text-secondary group-hover:text-primary-foreground transition-colors duration-300">
                  {category.count} active donors
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FoodCategories;
