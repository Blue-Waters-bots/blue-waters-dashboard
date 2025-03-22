
import { QualityPrediction } from "@/types/waterQuality";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Calendar, Clock } from "lucide-react";

interface QualityPredictorProps {
  prediction: QualityPrediction;
}

const QualityPredictor = ({ prediction }: QualityPredictorProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-water-safe";
    if (score >= 60) return "text-water-blue";
    if (score >= 40) return "text-water-warning";
    return "text-water-danger";
  };

  const getRingColor = (score: number) => {
    if (score >= 80) return "from-water-safe to-water-safe/50";
    if (score >= 60) return "from-water-blue to-water-blue/50";
    if (score >= 40) return "from-water-warning to-water-warning/50";
    return "from-water-danger to-water-danger/50";
  };

  // Generate forecast data (in a real app, this would come from your API)
  const forecastData = [
    { day: "Today", score: prediction.score },
    { day: "Tomorrow", score: Math.min(100, Math.max(0, prediction.score + (Math.random() * 10 - 5))) },
    { day: "Day 3", score: Math.min(100, Math.max(0, prediction.score + (Math.random() * 15 - 7))) },
    { day: "Day 4", score: Math.min(100, Math.max(0, prediction.score + (Math.random() * 20 - 10))) },
    { day: "Day 5", score: Math.min(100, Math.max(0, prediction.score + (Math.random() * 25 - 12))) },
    { day: "Day 6", score: Math.min(100, Math.max(0, prediction.score + (Math.random() * 30 - 15))) },
    { day: "Day 7", score: Math.min(100, Math.max(0, prediction.score + (Math.random() * 35 - 17))) },
  ];

  const getLineColor = (score: number) => {
    if (score >= 80) return "#10b981"; // safe
    if (score >= 60) return "#3b82f6"; // blue
    if (score >= 40) return "#f59e0b"; // warning
    return "#ef4444"; // danger
  };

  return (
    <div className="w-full space-y-8">
      <div className="glass-panel rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 relative w-48 h-48">
            {/* Score display with rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                "w-40 h-40 rounded-full bg-gradient-to-br",
                getRingColor(prediction.score)
              )} style={{ opacity: 0.15 }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                "w-32 h-32 rounded-full bg-gradient-to-br",
                getRingColor(prediction.score)
              )} style={{ opacity: 0.25 }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                "w-24 h-24 rounded-full bg-gradient-to-br",
                getRingColor(prediction.score)
              )} style={{ opacity: 0.4 }}></div>
            </div>
            {/* Central score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={cn("text-5xl font-light", getScoreColor(prediction.score))}>
                {prediction.score}
              </span>
              <span className={cn("text-sm font-medium", getScoreColor(prediction.score))}>
                {prediction.status}
              </span>
            </div>
            
            {/* Water ripple animation effect */}
            <div className="absolute inset-0">
              <div className="water-ripple w-full h-full"></div>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium mb-2">Analysis</h3>
            <p className="text-muted-foreground mb-4">{prediction.description}</p>
            
            <h4 className="font-medium mb-2">Recommended Improvements</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {prediction.improvementSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Forecast Section */}
      <div className="glass-panel rounded-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-medium">7-Day Forecast</h3>
            <p className="text-muted-foreground text-sm">Projected water quality score over the next week</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar size={16} className="mr-1" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock size={16} className="mr-1" />
              <span>Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ChartContainer 
            config={{
              quality: {
                label: "Quality Score",
                theme: {
                  light: getLineColor(prediction.score),
                  dark: getLineColor(prediction.score),
                },
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={forecastData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#888', fontSize: 12 }} 
                  axisLine={{ stroke: '#ddd' }} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: '#888', fontSize: 12 }} 
                  axisLine={{ stroke: '#ddd' }}
                  label={{ value: 'Quality Score', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 12 }}
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name) => [`${value.toFixed(1)}`, 'Quality Score']}
                    />
                  }
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke={`var(--color-quality)`}
                  strokeWidth={3}
                  dot={{ r: 6, fill: `var(--color-quality)`, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Trend Analysis</h4>
            <p className="mt-1 text-sm">
              {prediction.score > 70 
                ? "Quality score shows a stable trend with minor fluctuations expected." 
                : "Quality score indicates potential decline unless preventative measures are taken."}
            </p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Weather Impact</h4>
            <p className="mt-1 text-sm">
              Upcoming weather patterns may {prediction.score > 60 ? "slightly affect" : "significantly impact"} water quality. 
              Monitor closely during rainfall events.
            </p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Recommendation</h4>
            <p className="mt-1 text-sm">
              {prediction.score > 80 
                ? "Continue current water treatment protocols." 
                : "Consider increasing treatment frequency and monitoring intensity."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityPredictor;
