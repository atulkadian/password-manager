"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash2,
  CreditCard,
  Calendar,
  Building,
  User,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { decryptPassword } from "@/lib/encryption";
import { MasterPasswordModal } from "./master-password-modal";
import { EditCardDialog } from "./edit-card-dialog";

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

interface PendingAction {
  type: "viewCard" | "viewCVV" | "viewPIN" | "copyCard" | "copyCVV" | "copyPIN";
  cardId: string;
  encryptedData: string;
}

export function CardList() {
  const [cards, setCards] = useState<CardEntry[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleData, setVisibleData] = useState<
    Map<string, { cardNumber?: string; cvv?: string; pin?: string }>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );
  const { toast } = useToast();
  const [editingCard, setEditingCard] = useState<CardEntry | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEditMasterPasswordModal, setShowEditMasterPasswordModal] =
    useState(false);
  const [pendingEditCard, setPendingEditCard] = useState<CardEntry | null>(
    null
  );
  const [decryptedCardDataForEdit, setDecryptedCardDataForEdit] = useState({
    cardNumber: "",
    cvv: "",
    pin: "",
  });

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    const filtered = cards.filter(
      (card) =>
        card.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.cardholderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.cardType.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCards(filtered);
  }, [cards, searchTerm]);

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/cards");
      if (response.ok) {
        const data = await response.json();
        setCards(data);
      }
    } catch (error) {
      console.error("Failed to fetch cards:", error);
      toast({
        title: "Error",
        description: "Failed to load cards",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMasterPasswordSubmit = async (masterPassword: string) => {
    if (!pendingAction) return;

    try {
      const decrypted = await decryptPassword(
        pendingAction.encryptedData,
        masterPassword
      );

      if (pendingAction.type.startsWith("view")) {
        setVisibleData((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(pendingAction.cardId) || {};

          if (pendingAction.type === "viewCard") {
            existing.cardNumber = existing.cardNumber ? undefined : decrypted;
          } else if (pendingAction.type === "viewCVV") {
            existing.cvv = existing.cvv ? undefined : decrypted;
          } else if (pendingAction.type === "viewPIN") {
            existing.pin = existing.pin ? undefined : decrypted;
          }

          newMap.set(pendingAction.cardId, existing);
          return newMap;
        });
      } else if (pendingAction.type.startsWith("copy")) {
        let label = "";
        if (pendingAction.type === "copyCard") label = "Card Number";
        else if (pendingAction.type === "copyCVV") label = "CVV";
        else if (pendingAction.type === "copyPIN") label = "PIN";

        await copyToClipboard(decrypted, label);
      }

      setPendingAction(null);
    } catch (error) {
      throw new Error("Invalid master password");
    }
  };

  const requestMasterPassword = (
    type: PendingAction["type"],
    cardId: string,
    encryptedData: string
  ) => {
    setPendingAction({ type, cardId, encryptedData });
    setShowMasterPasswordModal(true);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCards((prev) => prev.filter((c) => c._id !== cardId));
        setVisibleData((prev) => {
          const newMap = new Map(prev);
          newMap.delete(cardId);
          return newMap;
        });
        toast({
          title: "Success",
          description: "Card deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete card",
        variant: "destructive",
      });
    }
  };

  const editCard = (card: CardEntry) => {
    setPendingEditCard(card);
    setShowEditMasterPasswordModal(true);
  };

  const handleEditMasterPasswordSubmit = async (masterPassword: string) => {
    if (!pendingEditCard) return;

    try {
      const decryptedCardNumber = await decryptPassword(
        pendingEditCard.encryptedCardNumber,
        masterPassword
      );
      const decryptedCVV = await decryptPassword(
        pendingEditCard.encryptedCVV,
        masterPassword
      );
      const decryptedPIN = pendingEditCard.encryptedPIN
        ? await decryptPassword(pendingEditCard.encryptedPIN, masterPassword)
        : "";

      setDecryptedCardDataForEdit({
        cardNumber: decryptedCardNumber,
        cvv: decryptedCVV,
        pin: decryptedPIN,
      });
      setEditingCard(pendingEditCard);
      setShowEditDialog(true);
      setPendingEditCard(null);
    } catch (error) {
      throw new Error("Invalid master password");
    }
  };

  const maskCardNumber = (cardNumber: string) => {
    if (cardNumber.length < 4) return cardNumber;
    return "**** **** **** " + cardNumber.slice(-4);
  };

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(.{4})/g, "$1 ").trim();
  };

  const isExpired = (month: string, year: string) => {
    const now = new Date();
    const expiry = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
    return expiry < now;
  };

  const isExpiringSoon = (month: string, year: string) => {
    const now = new Date();
    const expiry = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
    const monthsUntilExpiry =
      (expiry.getFullYear() - now.getFullYear()) * 12 +
      (expiry.getMonth() - now.getMonth());
    return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Your Cards</span>
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCards.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {cards.length === 0
                  ? "No cards saved yet"
                  : "No cards match your search"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.map((card) => {
                const cardData = visibleData.get(card._id) || {};
                const expired = isExpired(card.expiryMonth, card.expiryYear);
                const expiringSoon = isExpiringSoon(
                  card.expiryMonth,
                  card.expiryYear
                );

                return (
                  <Card
                    key={card._id}
                    className={`hover:shadow-md transition-shadow ${
                      expired
                        ? "border-red-200 dark:border-red-800"
                        : expiringSoon
                        ? "border-yellow-200 dark:border-yellow-800"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {card.cardName}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                card.cardType === "Credit"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {card.cardType}
                            </Badge>
                            {expired && (
                              <Badge variant="destructive" className="text-xs">
                                Expired
                              </Badge>
                            )}
                            {expiringSoon && !expired && (
                              <Badge
                                variant="outline"
                                className="text-xs border-yellow-500 text-yellow-600"
                              >
                                Expires Soon
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => editCard(card)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteCard(card._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-3">
                        {/* Bank Name */}
                        {card.bankName && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Building className="h-4 w-4" />
                            <span className="truncate">{card.bankName}</span>
                          </div>
                        )}

                        {/* Cardholder Name */}
                        <div className="flex items-center space-x-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">
                            {card.cardholderName}
                          </span>
                        </div>

                        {/* Card Number */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-mono">
                              {cardData.cardNumber
                                ? formatCardNumber(cardData.cardNumber)
                                : maskCardNumber(card.encryptedCardNumber)}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                requestMasterPassword(
                                  "viewCard",
                                  card._id,
                                  card.encryptedCardNumber
                                )
                              }
                              className="h-8 w-8 p-0"
                              title="Toggle card number visibility"
                            >
                              {cardData.cardNumber ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                requestMasterPassword(
                                  "copyCard",
                                  card._id,
                                  card.encryptedCardNumber
                                )
                              }
                              className="h-8 w-8 p-0"
                              title="Copy card number"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Expiry Date */}
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Expires: {card.expiryMonth}/{card.expiryYear}
                          </span>
                        </div>

                        {/* CVV */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              CVV: {cardData.cvv ? cardData.cvv : "***"}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                requestMasterPassword(
                                  "viewCVV",
                                  card._id,
                                  card.encryptedCVV
                                )
                              }
                              className="h-8 w-8 p-0"
                              title="Toggle CVV visibility"
                            >
                              {cardData.cvv ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                requestMasterPassword(
                                  "copyCVV",
                                  card._id,
                                  card.encryptedCVV
                                )
                              }
                              className="h-8 w-8 p-0"
                              title="Copy CVV"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* PIN */}
                        {card.encryptedPIN && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                PIN: {cardData.pin ? cardData.pin : "****"}
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  requestMasterPassword(
                                    "viewPIN",
                                    card._id,
                                    card.encryptedPIN
                                  )
                                }
                                className="h-8 w-8 p-0"
                                title="Toggle PIN visibility"
                              >
                                {cardData.pin ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  requestMasterPassword(
                                    "copyPIN",
                                    card._id,
                                    card.encryptedPIN
                                  )
                                }
                                className="h-8 w-8 p-0"
                                title="Copy PIN"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {card.notes && (
                          <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {card.notes}
                          </div>
                        )}

                        {/* Date */}
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Added {new Date(card.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <MasterPasswordModal
        open={showMasterPasswordModal}
        onOpenChange={setShowMasterPasswordModal}
        onSubmit={handleMasterPasswordSubmit}
        title="Enter Master Password"
        description={
          pendingAction?.type.startsWith("view")
            ? "Enter your master password to view this information"
            : "Enter your master password to copy this information"
        }
      />
      <MasterPasswordModal
        open={showEditMasterPasswordModal}
        onOpenChange={setShowEditMasterPasswordModal}
        onSubmit={handleEditMasterPasswordSubmit}
        title="Load Card for Editing"
        description="Enter your master password to load this card for editing"
      />
      <EditCardDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        card={editingCard}
        decryptedData={decryptedCardDataForEdit}
        onCardUpdated={fetchCards}
      />
    </>
  );
}
