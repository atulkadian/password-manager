"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { encryptPassword } from "@/lib/encryption";
import { MasterPasswordModal } from "./master-password-modal";
import { CreditCard, Calendar, Lock } from "lucide-react";

interface CardEntry {
  _id: string;
  cardName: string;
  encryptedCardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  encryptedCVV: string;
  encryptedPIN: string;
  cardholderName: string;
  bankName: string;
  cardType: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface DecryptedCardData {
  cardNumber: string;
  cvv: string;
  pin: string;
}

interface EditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: CardEntry | null;
  decryptedData: DecryptedCardData;
  onCardUpdated: () => void;
}

export function EditCardDialog({
  open,
  onOpenChange,
  card,
  decryptedData,
  onCardUpdated,
}: EditCardDialogProps) {
  const [formData, setFormData] = useState({
    cardName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    pin: "",
    cardholderName: "",
    bankName: "",
    cardType: "Credit",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (card && open && decryptedData) {
      setFormData({
        cardName: card.cardName,
        cardNumber: decryptedData.cardNumber,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        cvv: decryptedData.cvv,
        pin: decryptedData.pin,
        cardholderName: card.cardholderName,
        bankName: card.bankName,
        cardType: card.cardType,
        notes: card.notes,
      });
    }
  }, [card, open, decryptedData]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMasterPasswordSubmit = async (masterPassword: string) => {
    setIsLoading(true);
    try {
      const encryptedCardNumber = await encryptPassword(
        formData.cardNumber,
        masterPassword
      );
      const encryptedCVV = await encryptPassword(formData.cvv, masterPassword);
      const encryptedPIN = formData.pin
        ? await encryptPassword(formData.pin, masterPassword)
        : "";

      const response = await fetch(`/api/cards/${card?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardName: formData.cardName,
          encryptedCardNumber,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          encryptedCVV,
          encryptedPIN,
          cardholderName: formData.cardholderName,
          bankName: formData.bankName,
          cardType: formData.cardType,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update card");
      }

      toast({
        title: "Success",
        description: "Card updated successfully",
      });

      onCardUpdated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update card",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowMasterPasswordModal(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowMasterPasswordModal(true);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 16) {
      handleChange("cardNumber", formatted.replace(/\s/g, ""));
    }
  };

  const handleClose = () => {
    setFormData({
      cardName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      pin: "",
      cardholderName: "",
      bankName: "",
      cardType: "Credit",
      notes: "",
    });
    onOpenChange(false);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);
  const months = [
    { value: "01", label: "01 - January" },
    { value: "02", label: "02 - February" },
    { value: "03", label: "03 - March" },
    { value: "04", label: "04 - April" },
    { value: "05", label: "05 - May" },
    { value: "06", label: "06 - June" },
    { value: "07", label: "07 - July" },
    { value: "08", label: "08 - August" },
    { value: "09", label: "09 - September" },
    { value: "10", label: "10 - October" },
    { value: "11", label: "11 - November" },
    { value: "12", label: "12 - December" },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Edit Card</span>
            </DialogTitle>
            <DialogDescription>Update your card details</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Card Name</Label>
                <Input
                  id="cardName"
                  value={formData.cardName}
                  onChange={(e) => handleChange("cardName", e.target.value)}
                  placeholder="e.g., Main Credit Card"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardType">Card Type</Label>
                <Select
                  value={formData.cardType}
                  onValueChange={(value) => handleChange("cardType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit">Credit Card</SelectItem>
                    <SelectItem value="Debit">Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={formatCardNumber(formData.cardNumber)}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                value={formData.cardholderName}
                onChange={(e) => handleChange("cardholderName", e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
                placeholder="e.g., Chase Bank"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="expiryMonth"
                  className="flex items-center space-x-1"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Expiry Month</span>
                </Label>
                <Select
                  value={formData.expiryMonth}
                  onValueChange={(value) => handleChange("expiryMonth", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryYear">Expiry Year</Label>
                <Select
                  value={formData.expiryYear}
                  onValueChange={(value) => handleChange("expiryYear", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  value={formData.cvv}
                  onChange={(e) =>
                    handleChange("cvv", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin" className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>PIN (Optional)</span>
              </Label>
              <Input
                id="pin"
                type="password"
                value={formData.pin}
                onChange={(e) =>
                  handleChange("pin", e.target.value.replace(/\D/g, ""))
                }
                placeholder="1234"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Enter your card PIN if you want to store it securely
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional notes about this card..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <MasterPasswordModal
        open={showMasterPasswordModal}
        onOpenChange={setShowMasterPasswordModal}
        onSubmit={handleMasterPasswordSubmit}
        title="Encrypt Card Details"
        description="Enter your master password to encrypt and save the updated card"
      />
    </>
  );
}
