from typing import Dict, Any, Optional

class EdgeFunctionError(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 400
    ):
        self.code = code
        self.message = message
        self.details = details or {}
        self.status_code = status_code
        super().__init__(message)

    def to_response(self) -> Dict[str, Any]:
        return {
            "success": False,
            "error": {
                "code": self.code,
                "message": self.message,
                "details": self.details
            }
        }

# Common error codes
ERROR_CODES = {
    "AUTH_ERROR": "auth/error",
    "INVALID_INPUT": "input/invalid",
    "NOT_FOUND": "resource/not-found",
    "AI_ERROR": "ai/error",
    "DB_ERROR": "database/error",
    "NO_PROMPT": "prompt/not-found",
    "API_ERROR": "api/error"
}

def handle_error(error: Exception) -> Dict[str, Any]:
    """Convert exceptions to standardized error responses."""
    if isinstance(error, EdgeFunctionError):
        return error.to_response()
    
    # Handle unexpected errors
    return {
        "success": False,
        "error": {
            "code": ERROR_CODES["API_ERROR"],
            "message": str(error),
            "details": {}
        }
    }