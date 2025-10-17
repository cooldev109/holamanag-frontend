import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { clientApi } from "@/api/client";
import { date, money } from "@/i18n/format";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface Reservation {
  id: string;
  property: string;
  checkIn: string;
  checkOut: string;
  status: string;
  channel: string;
  currency: string;
  total: number;
  guests: number;
}

interface ReservationFilters {
  search: string;
  status: string;
  from: string;
  to: string;
}

export function ClientReservations() {
  const { t } = useTranslation("client");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ReservationFilters>({
    search: "",
    status: "",
    from: "",
    to: ""
  });

  const pageSize = 10;

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const result = await clientApi.listReservations(
        filters.search || undefined,
        filters.status || undefined,
        filters.from || undefined,
        filters.to || undefined,
        page,
        pageSize
      ) as { items: Reservation[]; total: number; page: number; size: number };
      setReservations(result.items);
      setTotal(result.total);
    } catch (error) {
      toast({
        title: t("status.error"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, toast, t]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleFilterChange = (key: keyof ReservationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "canceled": return "destructive";
      case "pending": return "secondary";
      default: return "outline";
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("reservations.title")}</h1>
        <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary-glow rounded-full mt-2" />
      </div>

      {/* Filters */}
      <Card className="sticky top-6 z-10 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("filters.search")}
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("filters.status")}</SelectItem>
                <SelectItem value="confirmed">{t("status.confirmed")}</SelectItem>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="canceled">{t("status.canceled")}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange("from", e.target.value)}
                className="w-[140px]"
              />
              <Input
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange("to", e.target.value)}
                className="w-[140px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>{t("tables.property")}</TableHead>
                  <TableHead>{t("tables.checkIn")}</TableHead>
                  <TableHead>{t("tables.checkOut")}</TableHead>
                  <TableHead>{t("tables.status")}</TableHead>
                  <TableHead>{t("tables.channel")}</TableHead>
                  <TableHead className="text-right">{t("tables.total")}</TableHead>
                  <TableHead className="text-center">{t("tables.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : reservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("empty.reservations")}
                    </TableCell>
                  </TableRow>
                ) : (
                  reservations.map((reservation) => (
                    <TableRow key={reservation.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{reservation.property}</TableCell>
                      <TableCell>{date(reservation.checkIn)}</TableCell>
                      <TableCell>{date(reservation.checkOut)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(reservation.status)}>
                          {t(`status.${reservation.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>{reservation.channel}</TableCell>
                      <TableCell className="text-right font-medium">
                        {money(reservation.total, reservation.currency)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/client/reservations/${reservation.id}`)}
                          className="hover:bg-primary/10"
                        >
                          {t("actions.view")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("pagination.prev")}
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="gap-2"
          >
            {t("pagination.next")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default ClientReservations;