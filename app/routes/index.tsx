import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

export const Route = createFileRoute("/")({
  component: HomePage,
});

//Aktive Links und dynamic routes könnte man auch noch einbauen

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container mx-auto max-w-md">
        <p className="text-center text-lg mb-4">
          Select a quiz type to get started!
        </p>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <Link
                to="/General"
                className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                General Quiz
              </Link>
              <Separator />
              <Link
                to="/Music"
                className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Music Quiz
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
