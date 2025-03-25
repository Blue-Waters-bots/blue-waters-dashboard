
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/avatar";
import { User } from "lucide-react";

const UserInfo = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="px-4 py-3 border-t border-b border-gray-100 mb-2">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 bg-sky-100 text-blue-600">
          <User className="h-5 w-5" />
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
