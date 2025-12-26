#!/bin/bash
# backup.sh
BACKUP_DIR="/backups/kasaku"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="./database/kasaku.db"

mkdir -p $BACKUP_DIR

# Backup database
sqlite3 $DB_PATH ".backup '$BACKUP_DIR/kasaku_$DATE.db'"

# Backup logs (jika ada)
tar -czf "$BACKUP_DIR/logs_$DATE.tar.gz" ./logs/

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/kasaku_$DATE.db"