import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const recentBookings = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    date: "Dec 15, 2023",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    date: "Dec 14, 2023",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    date: "Dec 13, 2023",
  },
  {
    name: "William Kim",
    email: "william.kim@email.com",
    date: "Dec 12, 2023",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    date: "Dec 11, 2023",
  },
];

export function RecentBookings() {
  return (
    <div className="space-y-8">
      {recentBookings.map((booking) => (
        <div key={booking.email} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={`https://avatar.vercel.sh/${booking.name}.png`}
              alt={booking.name}
            />
            <AvatarFallback>
              {booking.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{booking.name}</p>
            <p className="text-sm text-muted-foreground">{booking.email}</p>
          </div>
          <div className="ml-auto font-medium">{booking.date}</div>
        </div>
      ))}
    </div>
  );
}
