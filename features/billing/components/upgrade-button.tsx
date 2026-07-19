"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"
import { statusButtonClass } from "@/features/dashboard/lib/status-style";
import { startProSubscription } from "@/lib/billing";


type RazorpayCheckout = new (options: Record<string, unknown>) => {
    open: () => void;
};

declare global {
    interface Window {
        Razorpay?: RazorpayCheckout
    }
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";




export function UpgradeButton() {

    const router = useRouter();
    const [loading, setLoading] = useState(false);


    async function handleUpgrade() {
        const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!key) {
            toast.error("Razorpay is not configured yet.");
            return;
        }

        // give time to initilize the razorpay into the whole window
        if (!window.Razorpay) {
            toast.error("Checkout is still loading, please try again in a moment.");
            return;
        }

        setLoading(true);

        try {
            const { subscriptionId } = await startProSubscription();

            const checkout = new window.Razorpay({
                key,
                subscription_id: subscriptionId,
                name: "Swanpr",
                description: "Pro plan — unlimited AI reviews",
                handler: () => {
                    toast.success("Payment successful! Your Pro plan will activate shortly.");
                    router.refresh();
                },
            });

            // to pop up the razorpay window
            checkout.open();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Could not start checkout.";
            toast.error(message);
        } finally {
            setLoading(false);
        }

    }

    async function comingSoon() {
        toast.info("Coming soon", {
            description: "The upgrade flow is not available yet. Please check back soon.",
        });
    }

    return (
        <>
            <Script src={RAZORPAY_SCRIPT_URL} strategy="lazyOnload"></Script>
            {/* <Button
                onClick={handleUpgrade}
                disabled={loading}
                className={cn(statusButtonClass.success)}
            >
                {loading ? "Opening checkout…" : "Upgrade to Pro"}
            </Button> */}
            <Button
                onClick={comingSoon}
                className={cn(statusButtonClass.success)}
            >
                Coming Soon
            </Button>
        </>
    )
}