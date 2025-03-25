
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Mail, Lock, AlertCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to Blue Waters Dashboard",
        });
        navigate("/");
      } else {
        setError("Invalid email or password. Please try again.");
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-sky-50 flex flex-col md:flex-row items-center">
      {/* Left side with illustration and tagline */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col items-center md:items-start justify-center">
        <div className="mb-8 flex items-center">
          <img 
            src="/lovable-uploads/3c169f89-e8f8-44e0-aa59-62429c9be7a4.png" 
            alt="Blue Waters Logo" 
            className="h-12 mr-3" 
          />
          <h1 className="text-2xl font-bold text-blue-600">Blue Waters</h1>
        </div>
        
        <div className="text-center md:text-left mb-8">
          <h2 className="text-4xl font-bold text-sky-500 mb-2">
            Sign in to view your<br />Water quality.
          </h2>
          <p className="text-gray-600 mt-4 mb-6">
            Development & Commercialization of IoT Based Water<br />
            Quality Monitoring Technology
          </p>
          <p className="text-xl text-blue-700 font-semibold">
            Revolutionizing Water Industry with AI
          </p>
        </div>
        
        <img 
          src="/lovable-uploads/3c169f89-e8f8-44e0-aa59-62429c9be7a4.png" 
          alt="Person drinking water" 
          className="hidden md:block w-3/4 max-w-md"
        />
      </div>

      {/* Right side with login form */}
      <div className="w-full md:w-1/2 p-8 flex justify-center items-center">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-blue-700">Login</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm cursor-pointer">Remember me?</Label>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot Password?
                </a>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <p className="text-xs text-center w-full text-gray-500">
              By signing up, you agree to our <a href="#" className="text-blue-600">Terms and Conditions</a> & <a href="#" className="text-blue-600">Privacy Policy</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
