import { useState } from "react";
import { Star, CheckCircle2, Heart } from "lucide-react";
import { Modal, Button, Field, inputClass } from "@/components/ui";
import { sound } from "@/lib/sound";
import { toast } from "sonner";

export function RatingModal({
  open,
  orderNumber,
  onClose,
}: {
  open: boolean;
  orderNumber: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const availableTags = [
    "Crispiest Skin Ever 🔥",
    "Juicy to the Bone 🍗",
    "Generous Sawsawan 🌶️",
    "Arrived Steaming Hot ♨️",
    "Rider was Polite 🛵",
    "Fast Preparation ⏱️",
  ];

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sound.play("success");
    setSubmitted(true);
    toast.success("Thank you for your review! Salamat sa pagtangkilik!");
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setComment("");
    }, 1200);
  }

  return (
    <Modal open={open} title="Rate Your Boytag's Feast" onClose={onClose} maxWidth="max-w-md">
      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-leaf-soft text-leaf shadow-md">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="display text-xl font-bold text-ink">Salamat sa Feedback!</h3>
          <p className="text-xs text-muted">
            Your review helps our Santa Rosa grill masters maintain the highest standards.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <p className="text-muted">
            How was your roast chicken experience for Order <strong>{orderNumber}</strong>?
          </p>

          {/* Star selector */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  sound.play("click");
                  setRating(star);
                }}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="p-1 transition transform hover:scale-125"
                aria-label={`Rate ${star} star`}
              >
                <Star
                  className={`h-8 w-8 transition ${
                    (hovered || rating) >= star
                      ? "fill-amber-400 text-amber-400 drop-shadow-md"
                      : "text-line"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Compliment Tags */}
          <div className="space-y-1.5">
            <span className="font-semibold text-ink block">What did you love most?</span>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                    tags.includes(tag)
                      ? "bg-roast text-white shadow-sm"
                      : "bg-cream border border-line text-ink hover:border-roast/40"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <Field label="Personal Review Note">
            <textarea
              rows={3}
              placeholder="Tell our grill master what you think..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={inputClass()}
            />
          </Field>

          <div className="flex gap-2 pt-2 border-t border-line">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Maybe Later
            </Button>
            <Button type="submit" className="flex-1 font-bold">
              Submit Review
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
