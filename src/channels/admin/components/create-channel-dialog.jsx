import { Controller } from "react-hook-form";
import { Globe, Hash, Lock, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function CreateChannelDialog({
  open,
  onOpenChange,
  teams,
  form,
  onSubmit,
  onInvalidSubmit,
}) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary">
          <Plus className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl rounded-3xl border-none bg-white p-0 shadow-2xl">
        <DialogHeader className="px-6 pt-8 pb-4">
          <DialogTitle className="text-2xl font-black tracking-tight text-brand-ink">
            Create channel
          </DialogTitle>
          <DialogDescription className="text-sm text-brand-secondary">
            Choose a team, set the channel basics, and enable cross-functional access only when needed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-6 px-6 pb-7">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-brand-ink font-semibold">Team</Label>
              <Controller
                name="team_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-12 rounded-xl border-brand-line">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-brand-line p-1">
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id} className="rounded-xl">
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.team_id ? <p className="text-xs font-medium text-red-500">{errors.team_id.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-brand-ink font-semibold">Channel name</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-secondary/40" />
                <Input
                  id="name"
                  placeholder="hospital management"
                  className="h-12 rounded-xl border-brand-line pl-9"
                  {...register("name")}
                />
              </div>
              {errors.name ? <p className="text-xs font-medium text-red-500">{errors.name.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-brand-ink font-semibold">Slug</Label>
            <Input
              id="slug"
              placeholder="hospital-management"
              className="h-12 rounded-xl border-brand-line"
              {...register("slug")}
            />
            {errors.slug ? <p className="text-xs font-medium text-red-500">{errors.slug.message}</p> : null}
          </div>

          {errors.company_id ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {errors.company_id.message}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-brand-ink font-semibold">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this channel for?"
              className="min-h-24 rounded-xl border-brand-line"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Controller
              name="visibility"
              control={control}
              render={({ field }) => (
                <>
                  {[
                    { value: "public", label: "Public", description: "Team members can join", icon: Globe },
                    { value: "private", label: "Private", description: "Invite only", icon: Lock },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isActive = field.value === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                          isActive ? "border-brand-primary bg-brand-primary/5" : "border-brand-line hover:border-brand-primary/30"
                        )}
                      >
                        <div className={cn("rounded-xl p-2", isActive ? "bg-brand-primary text-white" : "bg-brand-soft text-brand-secondary")}>
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <p className="font-black text-brand-ink">{option.label}</p>
                          <p className="text-xs text-brand-secondary">{option.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            />
          </div>

          <Controller
            name="is_cross_team"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                onClick={() => field.onChange(!field.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition-all",
                  field.value ? "border-brand-primary bg-brand-primary/5" : "border-brand-line"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-brand-soft p-2 text-brand-primary">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <p className="font-black text-brand-ink">Cross-functional channel</p>
                    <p className="text-xs text-brand-secondary">
                      Allows adding users from other teams.
                    </p>
                  </div>
                </div>
                <div className={cn("relative h-6 w-10 rounded-full transition-colors", field.value ? "bg-brand-primary" : "bg-brand-line")}>
                  <span className={cn("absolute top-1 size-4 rounded-full bg-white transition-all", field.value ? "left-5" : "left-1")} />
                </div>
              </button>
            )}
          />

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-2xl px-6 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-2xl bg-brand-primary px-7 font-black hover:bg-brand-primary/90"
            >
              {isSubmitting ? "Creating..." : "Create channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
