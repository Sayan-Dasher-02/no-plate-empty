import { Leaf, Scale, TrendingDown, Award } from "lucide-react";

const stats = [
  {
    icon: Leaf,
    value: "2.1M",
    label: "Meals Redistributed",
    description: "Fresh meals saved from waste",
    color: "text-primary",
    bgColor: "bg-leaf-light",
  },
  {
    icon: Scale,
    value: "850K",
    label: "Kg CO₂ Saved",
    description: "Reduced carbon footprint",
    color: "text-secondary",
    bgColor: "bg-carrot-light",
  },
  {
    icon: TrendingDown,
    value: "45%",
    label: "Less Food Waste",
    description: "For partner organizations",
    color: "text-primary",
    bgColor: "bg-accent",
  },
  {
    icon: Award,
    value: "98%",
    label: "Satisfaction Rate",
    description: "From donors & recipients",
    color: "text-secondary",
    bgColor: "bg-carrot-light",
  },
];

const ImpactStats = () => {
  return (
    <section id="impact" className="py-24 bg-gradient-hero relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-foreground/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider mb-4 block">
            Our Impact
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            Making a Real Difference
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Every donation counts. Here's how our community is transforming food waste into meals that matter.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-primary-foreground/15 transition-all duration-300 border border-primary-foreground/10"
            >
              <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-primary-foreground font-semibold mb-1">{stat.label}</div>
              <div className="text-primary-foreground/60 text-sm">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
