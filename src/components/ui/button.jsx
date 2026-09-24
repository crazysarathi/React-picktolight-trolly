import * as React from "react"
import { cn } from "lib/utils"
import { Loader2 } from "lucide-react"

/**
 * Same Button as pick-to-light-react, extended with:
 *  - `secondary` variant (stack.md "Buttons (Secondary)" gradient tokens)
 *  - `xl` / `2xl` sizes for touchscreen kiosk targets (≥ 56px tall)
 *  - `active:` press feedback (touch has no hover)
 */
const Button = React.forwardRef(({ 
    className, 
    variant = "default", 
    size, 
    asChild = false, 
    loading = false, 
    isLoading = false,
    disabled = false,
    onClick,
    type = "button",
    children,
    ...props 
}, ref) => {
    const [internalLoading, setInternalLoading] = React.useState(false);
    const Comp = asChild ? React.Fragment : "button"
    
    const isSpinning = loading || isLoading || internalLoading;

    const handleClick = (e) => {
        if (isSpinning || disabled) {
            e.preventDefault();
            return;
        }

        if (onClick) {
            try {
                const res = onClick(e);
                if (res && typeof res.then === 'function') {
                    setInternalLoading(true);
                    res.finally(() => {
                        setInternalLoading(false);
                    });
                }
            } catch (err) {
                console.error("Button action error:", err);
            }
        }
    };

    let variantStyles = "";
    if (variant === "default") {
        variantStyles = "bg-ot-action-fill text-ot-action-fg hover:bg-ot-action-hover active:bg-ot-action-hover h-10 px-4 py-2";
    } else if (variant === "secondary") {
        variantStyles = "border border-ot-border/35 bg-gradient-to-b from-ot-btn-secondary-top to-ot-btn-secondary-bottom text-white hover:from-ot-surface-elev-top hover:to-ot-surface-elev-bottom active:from-ot-surface-elev-top active:to-ot-surface-elev-bottom h-10 px-4 py-2";
    } else if (variant === "outline") {
        variantStyles = "border border-ot-border/35 hover:bg-ot-surface-elev-bottom active:bg-ot-surface-elev-bottom text-white h-10 px-4 py-2";
    } else if (variant === "ghost") {
        variantStyles = "bg-transparent hover:bg-ot-surface-elev-bottom active:bg-ot-surface-elev-bottom";
    } else if (variant === "destructive") {
        variantStyles = "bg-red-600 hover:bg-red-700 active:bg-red-700 text-white h-10 px-4 py-2";
    }

    let sizeStyles = "";
    if (size === "sm") {
        sizeStyles = "h-8 rounded-md px-3 text-xs";
    } else if (size === "lg") {
        sizeStyles = "h-11 rounded-md px-8";
    } else if (size === "xl") {
        sizeStyles = "h-14 rounded-xl px-8 text-lg";
    } else if (size === "2xl") {
        sizeStyles = "h-[4.5rem] rounded-2xl px-14 text-2xl font-semibold tracking-wide";
    } else if (size === "icon") {
        sizeStyles = "h-9 w-9 p-0 flex items-center justify-center";
    } else if (size === "icon-lg") {
        sizeStyles = "h-12 w-12 p-0 flex items-center justify-center rounded-xl";
    }

    return (
        <Comp
            type={type}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius)] text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none relative active:scale-[0.97]",
                variantStyles,
                sizeStyles,
                className
            )}
            ref={ref}
            disabled={disabled || isSpinning}
            onClick={handleClick}
            {...props}
        >
            {isSpinning && (
                <Loader2 className={cn("w-4 h-4 animate-spin shrink-0", size !== "icon" && "mr-2")} />
            )}
            {(!isSpinning || size !== "icon") && children}
        </Comp>
    )
})
Button.displayName = "Button"

export { Button }
