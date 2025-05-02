import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Container,
  Chip,
  Fade,
  Grow,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from "../components/Layout";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function JobChatbotPage() {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [animateHeader, setAnimateHeader] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Animate header on initial load
  useEffect(() => {
    setTimeout(() => setAnimateHeader(true), 300);
  }, []);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume file (PDF) before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    // Add user message with some animated emoji
    setMessages((prev) => [...prev, { sender: "user", text: `Uploaded: ${file.name} 📄` }]);
    setLoading(true);
    setError("");

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newValue = prev + Math.random() * 15;
        return newValue > 95 ? 95 : newValue;
      });
    }, 300);

    try {
      const response = await fetch(`${BACKEND_URL}/chatbot/upload-resume`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setLoading(false);
        setUploadProgress(0);
        setFile(null);
      }, 500);

      const data = await response.json();

      if (response.ok) {
        let parsedRoles = [];

        try {
          // Ensure JSON response is clean
          const cleanedJson = data.suggested_roles.replace(/```json\n|\n```/g, "");
          const parsedData = JSON.parse(cleanedJson);

          parsedRoles = Array.isArray(parsedData.suggested_roles) ? parsedData.suggested_roles : [];
        } catch (err) {
          console.error("Error parsing job roles:", err);
        }

        if (parsedRoles.length > 0) {
          // Add typing indicator for bot
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "Analyzing your expertise... 🔍", isTyping: true }
          ]);
          
          // Replace typing indicator with real message after a delay
          setTimeout(() => {
            setMessages((prev) => [
              ...prev.filter(msg => !msg.isTyping),
              { 
                sender: "bot", 
                text: `I've analyzed your resume and found these perfect roles for your skills and experience: 💼` 
              },
            ]);
            
            // Add each role as a separate message with cool emoji indicators
            const roleEmojis = ['✨', '🚀', '🔥', '⭐', '💡', '📊', '🌟', '🏆'];
            
            parsedRoles.forEach((role, index) => {
              const emoji = roleEmojis[index % roleEmojis.length];
              
              setTimeout(() => {
                setMessages((prev) => [
                  ...prev,
                  { 
                    sender: "bot", 
                    text: `${emoji} ${role}`, 
                    isRole: true 
                  }
                ]);
              }, 600 + index * 600);
            });
            
            // Final message with advice
            setTimeout(() => {
              setMessages((prev) => [
                ...prev,
                { 
                  sender: "bot", 
                  text: "Feel free to upload a different resume if you'd like to explore more career options. I'm here to help! 🤝"
                }
              ]);
            }, 600 + parsedRoles.length * 600 + 800);
            
          }, 2000);
        } else {
          setMessages((prev) => [...prev, { sender: "bot", text: "I couldn't identify clear job matches from your resume. Try uploading a more detailed document with your key skills and experience highlighted. 🧐" }]);
        }
      } else {
        setError(data.error || "Failed to fetch job recommendations.");
      }
    } catch (err) {
      clearInterval(progressInterval);
      setLoading(false);
      setUploadProgress(0);
      setError("Connection error. Please check your internet and try again later. 🔄");
    }
  };
  
  const clearChat = () => {
    setMessages([]);
    setFile(null);
    setError("");
    setLoading(false);
    setUploadProgress(0);
  };

  const removeFile = () => {
    setFile(null);
    fileInputRef.current.value = "";
  };

  // Generate a wave-like background pattern for header (pure CSS)
  const headerBackground = {
    background: `
      linear-gradient(135deg, #6357ff 0%, #7b5ffc 100%),
      radial-gradient(circle at top left, rgba(255, 255, 255, 0.15) 25%, transparent 60%),
      radial-gradient(circle at bottom right, rgba(0, 0, 0, 0.08) 25%, transparent 60%)
    `,
    backgroundBlendMode: 'normal, overlay, multiply',
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ position: "relative", mb: 8 }}>
        <Grow in={animateHeader} timeout={1200}>
          <Paper 
            elevation={10} 
            sx={{ 
              p: { xs: 3, md: 5 }, 
              mb: 4, 
              borderRadius: 4,
              ...headerBackground,
              color: "white",
              overflow: "hidden",
              position: "relative",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(99, 87, 255, 0.25)"
            }}
          >
            {/* Animated floating particles */}
            <Box sx={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              overflow: "hidden",
              opacity: 0.6,
              zIndex: 0
            }}>
              {[...Array(6)].map((_, i) => (
                <Box 
                  key={i}
                  sx={{
                    position: "absolute",
                    width: Math.floor(Math.random() * 60) + 20,
                    height: Math.floor(Math.random() * 60) + 20,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: "50%",
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${Math.floor(Math.random() * 20) + 30}s infinite ease-in-out`,
                    zIndex: 0,
                    "@keyframes float": {
                      "0%": { transform: "translateY(0) rotate(0deg)" },
                      "50%": { transform: "translateY(-100px) rotate(180deg)" },
                      "100%": { transform: "translateY(0) rotate(360deg)" },
                    }
                  }}
                />
              ))}
            </Box>

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <EmojiObjectsIcon sx={{ fontSize: 54, mr: 1.5, animation: "pulse 3s infinite ease-in-out", 
                  "@keyframes pulse": {
                    "0%": { opacity: 0.7, transform: "scale(1)" },
                    "50%": { opacity: 1, transform: "scale(1.1)" },
                    "100%": { opacity: 0.7, transform: "scale(1)" },
                  }
                }} />
                <Typography 
                  variant="h3" 
                  component="h1" 
                  gutterBottom 
                  fontWeight="bold" 
                  sx={{ 
                    fontSize: { xs: "1.8rem", sm: "2.5rem" },
                    textShadow: "0 2px 10px rgba(0,0,0,0.2)"
                  }}
                >
                  AI Career Oracle
                </Typography>
              </Box>
              <Typography 
                variant="h6" 
                paragraph 
                sx={{ 
                  maxWidth: "85%", 
                  mx: "auto", 
                  opacity: 0.9, 
                  lineHeight: 1.6,
                  mb: 3
                }}
              >
                Discover your perfect career path with our cutting-edge AI that analyzes your skills and predicts your ideal professional journey
              </Typography>
              <Chip 
                icon={<WorkIcon />} 
                label="Powered by Neural Matching" 
                sx={{ 
                  bgcolor: "rgba(255, 255, 255, 0.25)", 
                  color: "white", 
                  fontWeight: "medium",
                  backdropFilter: "blur(5px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  px: 1
                }} 
              />
            </Box>
          </Paper>
        </Grow>

        <Paper 
          elevation={6} 
          sx={{ 
            p: 0, 
            mb: 3, 
            borderRadius: 3,
            minHeight: "65vh",
            display: "flex",
            flexDirection: "column",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.07)"
          }}
        >
          {/* Chat header */}
          <Box sx={{ 
            px: 3, 
            py: 2, 
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(to right, #f7f7ff, #f0f0ff)",
          }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar sx={{ bgcolor: "#6357ff", mr: 1.5 }}>
                <SmartToyIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold" color="#3a3a3a">
                Career AI Assistant
              </Typography>
            </Box>
            {messages.length > 0 && (
              <Tooltip title="Clear conversation">
                <IconButton 
                  onClick={clearChat} 
                  size="small" 
                  sx={{ 
                    color: "rgba(0,0,0,0.4)", 
                    "&:hover": { 
                      color: "rgba(99, 87, 255, 0.8)",
                      backgroundColor: "rgba(99, 87, 255, 0.08)" 
                    } 
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {messages.length === 0 ? (
            <Box 
              sx={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                flex: 1,
                p: { xs: 3, sm: 6 },
                background: "radial-gradient(circle at center, rgba(245,245,255,1) 0%, rgba(255,255,255,1) 80%)"
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  mb: 4,
                  width: 120,
                  height: 120,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    border: "2px dashed rgba(99, 87, 255, 0.3)",
                    animation: "spin 20s linear infinite",
                    top: 5,
                    left: 5,
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    }
                  }}
                />
                <Avatar 
                  sx={{ 
                    bgcolor: "#6357ff", 
                    width: 90, 
                    height: 90,
                    position: "absolute",
                    top: 15,
                    left: 15,
                    boxShadow: "0 4px 20px rgba(99, 87, 255, 0.3)"
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 42 }} />
                </Avatar>
                {[...Array(4)].map((_, i) => (
                  <Box 
                    key={i}
                    sx={{
                      position: "absolute",
                      width: 16,
                      height: 16,
                      backgroundColor: "#6357ff",
                      borderRadius: "50%",
                      opacity: 0.6,
                      top: 15 + Math.sin(i * Math.PI/2) * 80,
                      left: 15 + Math.cos(i * Math.PI/2) * 80,
                      animation: `pulse${i} 3s infinite ease-in-out`,
                      animationDelay: `${i * 0.5}s`,
                      boxShadow: "0 0 10px rgba(99, 87, 255, 0.5)",
                      "@keyframes pulse0": {
                        "0%": { transform: "scale(1)" },
                        "50%": { transform: "scale(1.5)" },
                        "100%": { transform: "scale(1)" },
                      },
                      "@keyframes pulse1": {
                        "0%": { transform: "scale(1.2)" },
                        "50%": { transform: "scale(0.8)" },
                        "100%": { transform: "scale(1.2)" },
                      },
                      "@keyframes pulse2": {
                        "0%": { transform: "scale(0.8)" },
                        "50%": { transform: "scale(1.3)" },
                        "100%": { transform: "scale(0.8)" },
                      },
                      "@keyframes pulse3": {
                        "0%": { transform: "scale(1.1)" },
                        "50%": { transform: "scale(0.9)" },
                        "100%": { transform: "scale(1.1)" },
                      },
                    }}
                  />
                ))}
              </Box>
              <Typography variant="h5" textAlign="center" fontWeight="bold" color="#333" gutterBottom>
                Let me find your dream career
              </Typography>
              <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ maxWidth: "75%", mb: 5, lineHeight: 1.6 }}>
                Upload your resume and I'll use advanced AI to match your unique skills and experience with the perfect job opportunities
              </Typography>
              
              <Box 
                sx={{ 
                  display: "flex", 
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%", 
                  maxWidth: "400px",
                  position: "relative"
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="resume-upload-empty"
                />
                <label htmlFor="resume-upload-empty" style={{ width: "100%" }}>
                  <Button 
                    variant="outlined" 
                    component="span" 
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    size="large"
                    sx={{ 
                      borderRadius: 4,
                      py: 2,
                      px: 3,
                      borderColor: "#6357ff",
                      borderWidth: 2,
                      color: "#6357ff",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      "&:before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "linear-gradient(135deg, rgba(99, 87, 255, 0.2) 0%, rgba(123, 95, 252, 0.2) 100%)",
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                      },
                      '&:hover': {
                        borderColor: "#534ad1",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 16px rgba(99, 87, 255, 0.2)",
                        "&:before": {
                          opacity: 1,
                        },
                      },
                      textTransform: "none",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                    }}
                  >
                    Upload Your Resume (PDF)
                  </Button>
                </label>
                
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  mt: 4, 
                  p: 2, 
                  borderRadius: 3, 
                  backgroundColor: "rgba(99, 87, 255, 0.08)",
                  width: "100%"
                }}>
                  <InfoOutlinedIcon fontSize="small" sx={{ color: "#6357ff", mr: 1.5 }} />
                  <Typography variant="body2" color="#6357ff" fontWeight="medium">
                    For best results, include your skills, past positions, and education details
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 1, overflowY: "auto", backgroundColor: "#FFFFFF", p: 2 }}>
              <List>
                {messages.map((msg, index) => (
                  <Fade in={true} key={index} timeout={500}>
                    <ListItem
                      sx={{ 
                        display: "flex", 
                        justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                        mb: 2,
                        px: 1,
                        position: "relative",
                      }}
                    >
                      {msg.sender === "bot" && !msg.isTyping && (
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: msg.isRole ? "rgba(99, 87, 255, 0.15)" : "#6357ff",
                              color: msg.isRole ? "#6357ff" : "white",
                              width: msg.isRole ? 45 : 40,
                              height: msg.isRole ? 45 : 40,
                              boxShadow: msg.isRole ? "none" : "0 4px 10px rgba(99, 87, 255, 0.2)"
                            }}
                          >
                            {msg.isRole ? <WorkIcon /> : <SmartToyIcon />}
                          </Avatar>
                        </ListItemAvatar>
                      )}
                      
                      {msg.isTyping ? (
                        <Box sx={{ 
                          display: "flex", 
                          backgroundColor: "#f0f0ff", 
                          p: 2, 
                          borderRadius: "18px 18px 18px 0",
                          ml: 7,
                          position: "relative",
                          "&:before": {
                            content: '""',
                            position: "absolute",
                            left: -12,
                            bottom: 0,
                            width: 0,
                            height: 0,
                            borderRight: "12px solid #f0f0ff",
                            borderTop: "12px solid transparent",
                          }
                        }}>
                          <Box sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            "& > div": {
                              width: 8,
                              height: 8,
                              backgroundColor: "#6357ff",
                              borderRadius: "50%",
                              margin: "0 2px",
                              opacity: 0.7,
                              animation: "bounce 1.4s infinite ease-in-out both",
                            },
                            "& > div:nth-of-type(1)": {
                              animationDelay: "-0.32s"
                            },
                            "& > div:nth-of-type(2)": {
                              animationDelay: "-0.16s"
                            },
                            "@keyframes bounce": {
                              "0%, 80%, 100%": { transform: "scale(0)" },
                              "40%": { transform: "scale(1)" }
                            }
                          }}>
                            <div></div>
                            <div></div>
                            <div></div>
                          </Box>
                        </Box>
                      ) : (
                        <ListItemText
                          primary={msg.text}
                          sx={{
                            backgroundColor: msg.sender === "user" 
                              ? "linear-gradient(135deg, #6983ff 0%, #6357ff 100%)" 
                              : msg.isRole 
                                ? "rgba(99, 87, 255, 0.08)" 
                                : "#f0f0ff",
                            background: msg.sender === "user" 
                              ? "linear-gradient(135deg, #6983ff 0%, #6357ff 100%)" 
                              : "none",
                            p: msg.isRole ? 1.5 : 2,
                            borderRadius: msg.sender === "user" ? "18px 18px 0 18px" : "18px 18px 18px 0",
                            maxWidth: "75%",
                            whiteSpace: "pre-line",
                            boxShadow: msg.sender === "user" 
                              ? "0 4px 15px rgba(99, 87, 255, 0.25)" 
                              : msg.isRole 
                                ? "none" 
                                : "0 2px 5px rgba(0,0,0,0.05)",
                            border: msg.isRole ? "1px solid rgba(99, 87, 255, 0.2)" : "none",
                            position: "relative",
                            "&:before": msg.sender === "user" ? {
                              content: '""',
                              position: "absolute",
                              right: -12,
                              bottom: 0,
                              width: 0,
                              height: 0,
                              borderLeft: "12px solid #6357ff",
                              borderTop: "12px solid transparent",
                            } : msg.sender === "bot" && !msg.isRole ? {
                              content: '""',
                              position: "absolute",
                              left: -12,
                              bottom: 0,
                              width: 0,
                              height: 0,
                              borderRight: "12px solid #f0f0ff",
                              borderTop: "12px solid transparent",
                            } : {},
                            "& .MuiTypography-root": {
                              color: msg.sender === "user" ? "white" : 
                                msg.isRole ? "#2d2868" : "#3a3a3a",
                              fontWeight: msg.isRole ? "600" : 
                                msg.sender === "bot" && index > 0 && messages[index-1].sender === "bot" && 
                                msg.text.length < 30 ? "500" : "normal",
                              fontSize: msg.isRole ? "1.05rem" : "inherit",
                            }
                          }}
                        />
                      )}
                      
                      {msg.sender === "user" && (
                        <ListItemAvatar sx={{ ml: 1 }}>
                          <Avatar sx={{ 
                            bgcolor: "#7e5fff",
                            boxShadow: "0 4px 10px rgba(99, 87, 255, 0.2)"
                          }}>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                      )}
                    </ListItem>
                  </Fade>
                ))}
                <div ref={messagesEndRef} />
              </List>
            </Box>
          )}

          <Box 
            sx={{ 
              p: 3, 
              borderTop: "1px solid rgba(0, 0, 0, 0.06)",
              background: "linear-gradient(to right, #f7f7ff, #f0f0ff)",
              position: "relative"
            }}
          >
            {loading && (
              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ 
                    height: 4,
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#6357ff"
                    }
                  }}
                />
              </Box>
            )}
            
            <Box 
              display="flex" 
              alignItems="center" 
              gap={2} 
              sx={{ 
                flexDirection: { xs: "column", sm: "row" }, 
                justifyContent: "center" 
              }}
            >
              {file ? (
                <Box 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    p: 1.5, 
                    px: 2.5,
                    borderRadius: 3, 
                    backgroundColor: "rgba(99, 87, 255, 0.08)",
                    border: "1px solid rgba(99, 87, 255, 0.2)",
                    width: isMobile ? "100%" : "auto",
                    maxWidth: isMobile ? "none" : "220px"
                  }}
                >
                  <DescriptionIcon sx={{ color: "#6357ff", mr: 1 }} />
                  <Typography 
                    noWrap 
                    sx={{ 
                      color: "#6357ff", 
                      fontWeight: "medium", 
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {file.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={removeFile}
                    sx={{ 
                      ml: 1, 
                      color: "rgba(0,0,0,0.4)",
                      "&:hover": { 
                        color: "#6357ff",
                        backgroundColor: "rgba(99, 87, 255, 0.1)" 
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="resume-upload"
                />
              )}
              
              {!file && (
                <label htmlFor="resume-upload" style={{ width: isMobile ? "100%" : "auto" }}>
                  <Button 
                    variant="outlined" 
                    component="span" 
                    startIcon={<CloudUploadIcon />}
                    fullWidth={isMobile}
                    size="large"
                    sx={{ 
                      borderRadius: 3,
                      py: 1.5,
                      px: 3,
                      borderColor: "#6357ff",
                      borderWidth: 2,
                      color: "#6357ff",
                      '&:hover': {
                        borderColor: "#534ad1",
                        backgroundColor: "rgba(99, 87, 255, 0.04)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(99, 87, 255, 0.15)",
                      },
                      textTransform: "none",
                      fontWeight: "600"
                    }}
                  >
                    Choose Resume (PDF)
                  </Button>
                </label>
              )}

              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={loading || !file}
                startIcon={loading ? 
                  <CircularProgress size={20} color="inherit" /> : 
                  <InsertDriveFileIcon />
                }
                endIcon={!loading && <ArrowForwardIcon />}
                size="large"
                sx={{ 
                  borderRadius: 3,
                  py: 1.5,
                  px: file ? 4 : 3,
                  backgroundColor: loading || !file ? "rgba(0, 0, 0, 0.12)" : "linear-gradient(135deg, #6357ff 0%, #7b5ffc 100%)",
                  color: "white",
                  textTransform: "none",
                  fontWeight: "600",
                  width: isMobile ? "100%" : "auto",
                  boxShadow: loading || !file ? "none" : "0 6px 16px rgba(99, 87, 255, 0.3)",
                  transition: "all 0.3s ease",
                  '&:hover': {
                    backgroundColor: loading || !file ? "rgba(0, 0, 0, 0.12)" : "linear-gradient(135deg, #5a4ee5 0%, #7055e8 100%)",
                    boxShadow: loading || !file ? "none" : "0 8px 20px rgba(99, 87, 255, 0.4)",
                    transform: loading || !file ? "none" : "translateY(-2px)",
                  },
                  '&:active': {
                    transform: "translateY(0)",
                    boxShadow: "0 3px 8px rgba(99, 87, 255, 0.3)",
                  }
                }}
              >
                {loading ? "Processing..." : file ? "Find My Perfect Career" : "Get Job Recommendations"}
              </Button>
            </Box>

            {error && (
              <Fade in={true}>
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: "rgba(244, 67, 54, 0.06)", 
                  border: "1px solid rgba(244, 67, 54, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Typography color="#d32f2f" fontWeight="medium" textAlign="center">
                    {error}
                  </Typography>
                </Box>
              </Fade>
            )}
            
            {/* Animated usage tip */}
            {!messages.length && (
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  mt: 3, 
                  justifyContent: "center",
                  animation: "fadeIn 1s ease-in",
                  "@keyframes fadeIn": {
                    "0%": { opacity: 0 },
                    "100%": { opacity: 1 },
                  }
                }}
              >
                <InfoOutlinedIcon fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  Your data is processed securely and privately
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
        
        {/* Feature highlights */}
        <Grow in={true} timeout={1500}>
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            mt: 4,
            flexDirection: { xs: "column", md: "row" },
            gap: 3
          }}>
            {[
              {
                icon: <SmartToyIcon sx={{ fontSize: 32, color: "#6357ff" }} />,
                title: "AI-Powered Analysis",
                description: "Advanced algorithms analyze your experience, skills and qualifications"
              },
              {
                icon: <WorkIcon sx={{ fontSize: 32, color: "#6357ff" }} />,
                title: "Industry Insights",
                description: "Get matched with roles from our database of thousands of current positions"
              },
              {
                icon: <EmojiObjectsIcon sx={{ fontSize: 32, color: "#6357ff" }} />,
                title: "Career Guidance",
                description: "Discover new possibilities you might not have considered before"
              }
            ].map((feature, index) => (
              <Paper
                key={index}
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(0, 0, 0, 0.03)",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 10px 25px rgba(99, 87, 255, 0.15)",
                    borderColor: "rgba(99, 87, 255, 0.2)"
                  }
                }}
              >
                <Box 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    backgroundColor: "rgba(99, 87, 255, 0.1)",
                    mb: 2
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Grow>
      </Container>
    </Layout>
  );
}