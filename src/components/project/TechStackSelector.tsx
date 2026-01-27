import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import techList, { getTechByName, techTypeLabels } from "../../lib/tech-list";
import type { TechType } from "../../lib/tech-list";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

interface TechStackSelectorProps {
  selectedTech: string[];
  onToggle: (techName: string) => void;
}

export function TechStackSelector({
  selectedTech,
  onToggle,
}: TechStackSelectorProps) {
  return (
    <Card className="md:col-span-6 lg:col-span-5">
      <CardHeader className="px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Tech Stack</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {selectedTech.length} selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        <Tabs defaultValue="language" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-transparent p-0">
            {(Object.keys(techTypeLabels) as TechType[]).map((type) => (
              <TabsTrigger
                key={type}
                value={type}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2.5 py-1 text-xs"
              >
                {techTypeLabels[type]}
              </TabsTrigger>
            ))}
          </TabsList>
          {(Object.keys(techTypeLabels) as TechType[]).map((type) => (
            <TabsContent key={type} value={type} className="mt-3">
              <ScrollArea className="h-36 rounded-md border">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 p-2">
                  {techList
                    .filter((tech) => tech.type === type)
                    .map((tech) => (
                      <label
                        key={tech.tech}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                          "hover:bg-muted/50",
                          selectedTech.includes(tech.tech) &&
                            "bg-primary/10 hover:bg-primary/15",
                        )}
                      >
                        <Checkbox
                          checked={selectedTech.includes(tech.tech)}
                          onCheckedChange={() => onToggle(tech.tech)}
                          className="shrink-0 h-3.5 w-3.5"
                        />
                        <img
                          src={tech.icon}
                          alt={tech.name}
                          className="h-3.5 w-3.5 shrink-0"
                        />
                        <span className="text-xs truncate">{tech.name}</span>
                      </label>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        {selectedTech.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t">
            {selectedTech.map((techName) => {
              const tech = getTechByName(techName);
              return tech ? (
                <Badge
                  key={tech.tech}
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-destructive/20 text-xs py-0.5 h-6"
                  onClick={() => onToggle(tech.tech)}
                >
                  <img src={tech.icon} alt={tech.name} className="h-3 w-3" />
                  {tech.name}
                  <X className="h-3 w-3" />
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
