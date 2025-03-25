
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  return (
    <Button 
      variant="ghost" 
      className="flex w-full justify-start items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
      onClick={handleLogout}
    >
      <LogOut size={18} />
      <span>Logout</span>
    </Button>
  );
};

export default LogoutButton;
