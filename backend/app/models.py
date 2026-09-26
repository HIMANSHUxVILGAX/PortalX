from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
import datetime
import os

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    handle = Column(String, unique=True, index=True)
    display_name = Column(String)
    upi_id = Column(String)
    avatar_url = Column(String)
    kyc_verified = Column(Boolean, default=False)
    pin_hash = Column(String)  # Storing hashed PIN
    total_spend_limit = Column(Float, default=50000.0)
    subscription = relationship("SubscriptionTier", back_populates="user", uselist=False)


class SubscriptionTier(Base):
    __tablename__ = 'subscription_tiers'
    id = Column(Integer, primary_key=True, index=True)
    tier = Column(String)
    name = Column(String)
    price = Column(String)
    sessions_allowed = Column(Integer)
    sessions_used = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship("User", back_populates="subscription")


class CryptoWallet(Base):
    __tablename__ = 'crypto_wallets'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    chain = Column(String)  # ETH, SOL
    address = Column(String)
    balance = Column(Float, default=0.0)
    user = relationship("User")


class GuestSession(Base):
    __tablename__ = 'guest_sessions'
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    uit_token = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    expires_at = Column(DateTime)
    risk_score = Column(Float)
    user = relationship("User")


class PaymentTransaction(Base):
    __tablename__ = 'payments'
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey('guest_sessions.session_id'))
    vpa = Column(String)
    merchant_name = Column(String)
    amount = Column(Float)
    status = Column(String)  # SUCCESS, FAILED
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))


class StreamedDocument(Base):
    __tablename__ = 'streamed_documents'
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey('guest_sessions.session_id'))
    document_name = Column(String)
    source = Column(String)  # DigiLocker, Parivahan
    is_viewed = Column(Boolean, default=False)


# Setup SQLite Database
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(CURRENT_DIR, "portelx.db")
engine = create_engine(
    f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)
    # Seed dummy owner if not exists
    db = SessionLocal()
    if not db.query(User).filter(User.handle == "@rahul").first():
        user = User(
            handle="@rahul",
            display_name="Rahul Sharma",
            upi_id="rahul@portelx",
            pin_hash="hashed_1234",
            total_spend_limit=50000.0,
            kyc_verified=True,
            avatar_url="https://ui-avatars.com/api/?name=Rahul+Sharma&background=1E293B&color=00e5ff"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        sub = SubscriptionTier(
            tier="premium",
            name="PortelX Premium",
            price="₹2,999/yr",
            sessions_allowed=-1,
            sessions_used=42,
            is_active=True,
            user_id=user.id
        )
        db.add(sub)
        db.commit()
    db.close()


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at portelx.db!")
