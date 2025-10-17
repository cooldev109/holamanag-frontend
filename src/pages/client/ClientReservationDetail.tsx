import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { clientApi } from "@/api/client";
import { date, money } from "@/i18n/format";
import { ChevronLeft, Calendar, Users, MapPin } from "lucide-react";

interface ReservationDetail {
  id: string;
  property: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  status: string;
  channel: string;
  amounts: {
    currency: string;
    subtotal: number;
    taxes: number;
    total: number;
  };
  notes?: string;
}

export function ClientReservationDetail() {
  const { t } = useTranslation("client");
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const result = await clientApi.getReservation(id);
        setReservation(result);
      } catch (error) {
        toast({
          title: t("status.error"),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id, t, toast]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "canceled": return "destructive";
      case "pending": return "secondary";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("status.error")}</p>
          <Button asChild className="mt-4">
            <Link to="/client/reservations">{t("pagination.prev")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/client/reservations">
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("pagination.prev")}
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("reservation.detail")} {reservation.id}
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary-glow rounded-full mt-2" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("labels.property")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{reservation.property}</h3>
              <p className="text-sm text-muted-foreground">{reservation.channel}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("labels.status")}</span>
              <Badge variant={getStatusVariant(reservation.status)}>
                {t(`status.${reservation.status}`)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-muted-foreground">{t("labels.checkIn")}</p>
                <p className="font-medium">{date(reservation.checkIn)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("labels.checkOut")}</p>
                <p className="font-medium">{date(reservation.checkOut)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stay Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("detail.nights")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t("detail.nights")}</p>
                <p className="font-medium text-2xl">{reservation.nights}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("detail.guests")}</p>
                <p className="font-medium text-2xl flex items-center gap-1">
                  <Users className="h-5 w-5" />
                  {reservation.guests}
                </p>
              </div>
            </div>

            {reservation.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{reservation.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amounts */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("detail.total")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("detail.subtotal")}</span>
                <span>{money(reservation.amounts.subtotal, reservation.amounts.currency)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("detail.taxes")}</span>
                <span>{money(reservation.amounts.taxes, reservation.amounts.currency)}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t("detail.total")}</span>
                  <span>{money(reservation.amounts.total, reservation.amounts.currency)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ClientReservationDetail;